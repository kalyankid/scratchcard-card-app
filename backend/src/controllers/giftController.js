// controllers/giftController.js
import UserGift from "../models/UserGift.js";
import ScratchCard from "../models/ScratchCard.js";
import GiftAssignment from "../models/GiftAssignment.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/gifts";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `gift-${Date.now()}-${Math.random().toString(36).substr(2, 5)}${ext}`;
    cb(null, filename);
  },
});

export const upload = multer({ storage });

export const addAndAssignGifts = async (req, res) => {
  try {
    console.log("req.body:", req.body); // DEBUG
    console.log("req.files:", req.files?.map(f => f.fieldname)); // DEBUG
    const { purchaseId, mode = "add", fillFallback = true } = req.body;
    const userId = req.user.userId;

    // Parse gifts from gifts[0][name], gifts[0][quantity], etc.
   let rawGifts = [];

if (Array.isArray(req.body.gifts)) {
  // Case 1: received as array (your current request)
  rawGifts = req.body.gifts
    .map(g => ({
      name: g.name,
      quantity: parseInt(g.quantity) || 0,
    }))
    .filter(g => g.name && g.quantity > 0);
} else {
  // Case 2: fallback if sent as gifts[0][name] format
  let i = 0;
  while (req.body[`gifts[${i}][name]`]) {
    const name = req.body[`gifts[${i}][name]`];
    const quantity = parseInt(req.body[`gifts[${i}][quantity]`]) || 0;
    if (name && quantity > 0) {
      rawGifts.push({ name, quantity });
    }
    i++;
  }
}

if (rawGifts.length === 0) {
  return res.status(400).json({ message: "At least one valid gift required" });
}

    // Extract uploaded files: images[0], images[1], ...
    const files = req.files || [];
    const imageMap = {}; // index → imageUrl

    files.forEach(file => {
      const match = file.fieldname.match(/^images\[(\d+)\]$/);
      if (match) {
        const idx = parseInt(match[1]);
        imageMap[idx] = `/uploads/gifts/${file.filename}`;
      }
    });

    // Attach imageUrl to each gift
    const gifts = rawGifts.map((g, idx) => ({
      ...g,
      imageUrl: imageMap[idx] || null,
    }));

    // Build filter
    const filter = { userId, scratched: false, prize: null };
    if (purchaseId) filter.purchaseId = purchaseId;

    let cards = await ScratchCard.find(filter);

    if (mode === "reassign") {
      await ScratchCard.updateMany(filter, { prize: null, giftImageUrl: null });
      cards = await ScratchCard.find(filter);
    }

    if (cards.length === 0) {
      return res.status(400).json({ message: "No unscratched cards" });
    }

    // Build prize pool
    const prizePool = [];
    gifts.forEach(gift => {
      for (let i = 0; i < gift.quantity; i++) {
        prizePool.push({
          name: gift.name,
          imageUrl: gift.imageUrl,
        });
      }
    });

    // Shuffle
    const shuffled = prizePool.sort(() => Math.random() - 0.5);
    const assignCount = Math.min(shuffled.length, cards.length);
    let fallbackFilled = 0;

    // Assign to cards
    for (let i = 0; i < assignCount; i++) {
      cards[i].prize = shuffled[i].name;
      cards[i].giftImageUrl = shuffled[i].imageUrl;
      await cards[i].save();
    }

    // Fallback
    if (fillFallback && assignCount < cards.length) {
      fallbackFilled = cards.length - assignCount;
      for (let i = assignCount; i < cards.length; i++) {
        cards[i].prize = "Better Luck Next Time";
        cards[i].giftImageUrl = null;
        await cards[i].save();
      }
    }

    // Save history
    await new GiftAssignment({
      userId,
      purchaseId,
      gifts: gifts.map(g => ({ name: g.name, quantity: g.quantity, imageUrl: g.imageUrl })),
      mode,
      assignedCount: assignCount,
      fallbackFilled,
    }).save();

    res.json({
      message: "Gifts assigned successfully",
      assignCount,
      fallbackFilled,
      imagesUploaded: Object.keys(imageMap).length,
    });
  } catch (err) {
    console.error("Gift assign error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// --- Other functions unchanged ---
export const getAssignmentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { purchaseId } = req.query;
    const filter = { userId };
    if (purchaseId) filter.purchaseId = purchaseId;

    const history = await GiftAssignment.find(filter)
      .sort({ assignedAt: -1 })
      .select("gifts assignedCount assignedAt mode");

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserGifts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userGifts = await UserGift.findOne({ userId });
    res.json(userGifts?.gifts || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllAssignedGifts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const assignments = await GiftAssignment.find({ userId })
      .populate({
        path: "purchaseId",
        select: "offerId totalCards",
        populate: { path: "offerId", select: "title" },
      })
      .sort({ assignedAt: -1 });

    const result = assignments.map(a => ({
      _id: a._id,
      offerTitle: a.purchaseId?.offerId?.title || "Unknown",
      totalCards: a.purchaseId?.totalCards || 0,
      assignedAt: a.assignedAt,
      mode: a.mode,
      gifts: a.gifts.map(g => ({
        name: g.name,
        quantity: g.quantity,
        imageUrl: g.imageUrl || null,
      })),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};