import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";


// Signup
export const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, mobile, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or mobile already exists" });
    }

    const user = new User({ firstName, lastName, email, mobile, passwordHash: password });
    await user.save();

    res.status(201).json({ message: "Signup successful. Waiting for admin approval." });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Login
// Full login function - replace existing
export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email }).select("firstName lastName status role passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.status !== "approved") return res.status(403).json({ message: `User is ${user.status}` });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      userId: user._id.toString(),
      role: user.role || "retailer",
      firstName: user.firstName || "",
      lastName: user.lastName || ""
    });
  } catch (err) {
    // console.error("Login backend error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Check user status - change to email query
export const getStatus = async (req, res) => {
  try {
    const { email } = req.query;  // Changed from params.id
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ status: user.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Change Password
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from JWT
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



