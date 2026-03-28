// controllers/dashboardController.js
import ScratchCard from "../models/ScratchCard.js";
import User from "../models/User.js"; 
import { fileURLToPath } from "url";
import path from "path";  // ← ADD THIS

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const getScratchCards = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { scratched } = req.query;
    const filter = { userId };
    if (scratched !== undefined) filter.scratched = scratched === "true";

    // Include giftImageUrl in selection
    const cards = await ScratchCard.find(filter).select("id scratched prize scratchedAt giftImageUrl");

    // Map to imageUrl for frontend consistency
    const formattedCards = cards.map(card => ({
      _id: card._id,
      scratched: card.scratched,
      prize: card.prize,
      scratchedAt: card.scratchedAt,
      imageUrl: card.giftImageUrl,  // ⚡ alias for frontend
    }));

    res.json(formattedCards);
  } catch (err) {
    console.error("getScratchCards error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};


export const scratchCard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cardId = req.params.id;

    console.log("Scratching card ID:", cardId);
    console.log("User ID:", userId);

    if (!cardId) {
      console.error("Missing cardId in URL params:", req.params);
      return res.status(400).json({ message: "Card ID is required in URL" });
    }

    const card = await ScratchCard.findOne({ _id: cardId, userId });

    if (!card) {
      console.log("Card not found for ID:", cardId);
      return res.status(404).json({ message: "Card not found" });
    }

    if (card.scratched) {
      console.log("Card already scratched:", cardId);
      return res.status(400).json({
        message: "Already scratched",
        prize: card.prize || "No Prize",
        scratchedAt: card.scratchedAt,
      });
    }

    // Mark as scratched
    card.scratched = true;
    card.scratchedAt = new Date();
    await card.save();

    console.log("Card scratched successfully:", cardId);

    res.json({
      _id: card._id,
      prize: card.prize || "No Prize",
      scratched: true,
      scratchedAt: card.scratchedAt,
      imageUrl: card.giftImageUrl,
    });
  } catch (err) {
    console.error("scratchCard error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

// Upload a banner
export const uploadBanner = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    console.log("MULTER FILE:", req.file); // ← ADD THIS
    console.log("SAVING TO:", req.file.path); // ← ADD THIS

    // const bannerUrl = `${req.protocol}://${req.get("host")}/uploads/banners/${req.file.filename}`;
    const bannerUrl = `https://${req.get("host")}/uploads/banners/${req.file.filename}`;


    const user = await User.findById(req.user.userId);
    user.banners = user.banners || [];
    user.banners.push(bannerUrl);
    await user.save();

    res.json({ message: "Banner uploaded", banners: user.banners });
  } catch (err) {
    console.error("uploadBanner error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all banners for a user
export const getBanners = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.status(200).json({ banners: user.banners || [] });
  } catch (err) {
    console.error("getBanners error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const userId = req.user.userId; // ⚡ use userId, not _id
    const { url } = req.body;

    if (!url) return res.status(400).json({ message: "Banner URL is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove the banner from the array
    user.banners = user.banners.filter(b => b !== url);
    await user.save();

    res.json({ message: "Banner removed successfully", banners: user.banners });
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: "Failed to remove banner" });
  }
};


