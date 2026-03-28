// routes/purchaseRoutes.js
import express from "express";
import {
  purchaseOffer,
  getUserPurchases,
  uploadPaymentScreenshot,
  adminUploadPaymentScreenshot 
} from "../controllers/purchaseController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import Purchase from "../models/Purchase.js";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `payment_${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({ storage });

const router = express.Router();

// EXISTING ROUTES
router.post("/", authenticate, purchaseOffer);
router.get("/", authenticate, getUserPurchases);
router.get("/:id", authenticate, async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .select("totalCards offerId")
      .populate("offerId", "title");
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// THIS IS THE ONLY LINE THAT WAS BROKEN BEFORE
router.post(
  "/upload-screenshot",
  authenticate,
  upload.single("screenshot"),
  uploadPaymentScreenshot
);

router.post(
  "/admin-upload-screenshot",
  upload.single("screenshot"),
  adminUploadPaymentScreenshot
);

// Admin pending
router.get("/pending", authenticate, async (req, res) => {
  try {
    const purchases = await Purchase.find({ status: "pending" })
      .populate("userId", "firstName lastName email mobile")
      .populate("offerId", "title price cards")
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;