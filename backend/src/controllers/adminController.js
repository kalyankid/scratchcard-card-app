import User from "../models/User.js";
import Purchase from "../models/Purchase.js";
import Admin from "../models/Admin.js";
import GiftAssignment from "../models/GiftAssignment.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  console.log("LOGIN BODY:", req.body);
console.log("Entered length:", password.length);

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Compare password directly using bcrypt
    console.log("Admin found:", admin.email);
console.log("Entered:", password);
console.log("Stored hash:", admin.password);
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Match result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "1d" }
    );

    res.json({
      message: "✅ Login successful",
      token,
      admin: { email: admin.email, id: admin._id },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const registerAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ email, password });

    res.status(201).json({
      message: "✅ Admin created successfully",
      admin: { id: admin._id, email: admin.email },
    });
  } catch (error) {
    console.error("Register admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// List all users
export const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// Approve user
export const approveUser = async (req, res) => {
  const role = req.body?.role;  // Use optional chaining to handle undefined req.body
  const update = { status: "approved" };
  if (role) update.role = role;
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json(user);
};

// Reject user
export const rejectUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
  res.json(user);
};

// Assign role
export const assignRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  res.json(user);
};

// ADD THIS FUNCTION
export const getUsersWithPurchases = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("firstName lastName email mobile role")
      .lean();

    const userIds = users.map(u => u._id);

    // Fetch purchases
    const purchases = await Purchase.find({ userId: { $in: userIds } })
      .populate("offerId", "title price cards")
      .select("userId offerId price totalCards createdAt")
      .lean();

    // Fetch gift assignments
    const assignments = await GiftAssignment.find({ userId: { $in: userIds } })
      .populate("purchaseId", "offerId")
      .select("userId assignedAt assignedCount gifts")
      .lean();

    // Group by user
    const result = users.map(user => {
      const userPurchases = purchases
        .filter(p => p.userId.toString() === user._id.toString())
        .map(p => ({
          _id: p._id,
          offer: p.offerId?.title || "Unknown",
          price: p.offerId?.price || p.price || 0,
          cards: p.totalCards,
          date: p.createdAt,
        }));

      const userAssignments = assignments
        .filter(a => a.userId.toString() === user._id.toString())
        .map(a => ({
          _id: a._id,
          date: a.assignedAt,
          assignedCount: a.assignedCount,
          gifts: a.gifts.map(g => ({ name: g.name, quantity: g.quantity })),
        }));

      return {
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        purchases: userPurchases,
        gifts: userAssignments,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("getUsersWithPurchases error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ADD THIS FUNCTION
export const approvePurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const purchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      { status: "verified" },
      { new: true }
    ).populate("userId", "firstName lastName email");

    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    res.json({ message: "Purchase verified", purchase });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectPurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const purchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      { status: "rejected" },
      { new: true }
    );
    res.json({ message: "Purchase rejected", purchase });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingPurchases = async (req, res) => {
  try {
    const pendingPurchases = await Purchase.find({ status: "pending" })
      .populate("userId", "firstName lastName email")
      .populate("offerId", "title price");

    res.status(200).json(pendingPurchases);
  } catch (error) {
    console.error("Error fetching pending purchases:", error);
    res.status(500).json({ message: "Failed to fetch pending purchases" });
  }
};


// ✅ Get all purchases (approved, pending, rejected)
// ✅ Safe version of getAllPurchases
export const getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("userId", "firstName lastName email mobile")
      .populate("offerId", "title price")
      .lean();

    // Filter out invalid or orphaned purchases
    const validPurchases = purchases.filter(p => p.userId && p.offerId);

    const result = validPurchases.map((p) => ({
      _id: p._id,
      userId: p.userId,
      offerId: p.offerId,
      totalCards: p.totalCards,
      paymentScreenshot: p.paymentScreenshot,
      createdAt: p.createdAt,
      status: p.status || "pending",
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching all purchases:", error);
    res.status(500).json({ message: "Failed to fetch all purchases" });
  }
};


