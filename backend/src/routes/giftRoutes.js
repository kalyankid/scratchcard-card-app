// routes/giftRoutes.js
import express from "express";
import {
  addAndAssignGifts,
  getUserGifts,
  getAssignmentHistory,
  getAllAssignedGifts,
  upload,
} from "../controllers/giftController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Use .any() for files + express.urlencoded for form fields
router.post(
  "/assign",
  authenticate,
  (req, res, next) => {
    // Parse form fields
    express.urlencoded({ extended: true })(req, res, () => {
      // Then parse files
      upload.any()(req, res, (err) => {
        if (err) {
        console.error("Multer error:", err);
        return res.status(400).json({ message: err.message });
        }
        next();
      });
    });
  },
  addAndAssignGifts
);

router.get("/", authenticate, getUserGifts);
router.get("/history", authenticate, getAssignmentHistory);
router.get("/all", authenticate, getAllAssignedGifts);

export default router;