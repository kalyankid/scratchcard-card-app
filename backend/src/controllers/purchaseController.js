import Purchase from "../models/Purchase.js";
import ScratchCard from "../models/ScratchCard.js";
import Offer from "../models/Offer.js";

export const purchaseOffer = async (req, res) => {
  try {
    const { offerId } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!offerId) return res.status(400).json({ message: "OfferId is required" });

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    if (!offer.cards || offer.cards <= 0)
      return res.status(400).json({ message: "Offer cards are invalid" });

    const purchase = new Purchase({
      userId,
      offerId,
      totalCards: offer.cards,
      price: offer.price || 0, // Make sure price exists
    });
    await purchase.save();

    const newCards = Array.from({ length: offer.cards }, () =>
      new ScratchCard({ userId, purchaseId: purchase._id })
    );

    await ScratchCard.insertMany(newCards);

    res.status(201).json({
      message: `Purchase successful - ${offer.cards} cards ready for gift assignment`,
      totalCards: offer.cards,
    });
  } catch (err) {
    console.error("Purchase error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
};


export const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.userId;
    const purchases = await Purchase.find({ userId })
      .populate("offerId", "title price")
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    // console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Add this function
export const uploadPaymentScreenshot = async (req, res) => {
  try {
    const { purchaseId } = req.body;
    const userId = req.user.userId;

    if (!req.file) return res.status(400).json({ message: "Screenshot required" });

    const purchase = await Purchase.findOneAndUpdate(
      { _id: purchaseId, userId },
      { 
        paymentScreenshot: `/uploads/${req.file.filename}`,
        status: "pending"
      },
      { new: true }
    );

    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    res.json({ message: "Screenshot uploaded. Waiting for admin approval.", purchase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const adminUploadPaymentScreenshot = async (req, res) => {
  try {
    const { purchaseId } = req.body;

    if (!req.file) return res.status(400).json({ message: "Screenshot required" });

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });

    // Replace old file if already exists
    if (purchase.paymentScreenshot) {
      const oldPath = path.join(process.cwd(), purchase.paymentScreenshot);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    purchase.paymentScreenshot = `/uploads/${req.file.filename}`;
    await purchase.save();

    res.json({
      message: "Screenshot uploaded successfully by admin.",
      purchase,
    });
  } catch (err) {
    console.error("Admin Upload Error:", err);
    res.status(500).json({ message: err.message });
  }
};
