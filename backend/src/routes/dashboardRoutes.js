// dashboardRoute.js (UPDATED WITH LOGGING)
import express from "express";
import { getScratchCards, scratchCard, uploadBanner, getBanners, deleteBanner  } from "../controllers/dashboardController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Use project-root-based path to backend/uploads/banners
const BANNERS_DIR = path.join(process.cwd(), "uploads", "banners");
console.log("process.cwd():", process.cwd()); // Log this to ensure it's pointing to your 'backend' level, not 'backend/backend'
console.log("✅ Final banner directory path:", BANNERS_DIR);



// ✅ Ensure folder exists
if (!fs.existsSync(BANNERS_DIR)) {
  fs.mkdirSync(BANNERS_DIR, { recursive: true });
  console.log("✅ Created folder:", BANNERS_DIR);
} else {
  console.log("✅ Folder exists:", BANNERS_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const absolutePath = path.resolve(BANNERS_DIR);
    console.log("📁 Uploading to (absolute):", absolutePath);
    cb(null, absolutePath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});


const upload = multer({ storage });

router.get("/scratch-cards", authenticate, getScratchCards);
router.patch("/scratch-cards/:id/scratch", authenticate, scratchCard);

router.post("/banner", authenticate, upload.single("banner"), uploadBanner); // Upload banner
router.get("/banner", authenticate, getBanners); // Get all user banners
router.delete("/banner", authenticate, deleteBanner);


export default router;