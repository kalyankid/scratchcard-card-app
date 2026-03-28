import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import offerRoutes from "./routes/offer.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import giftRoutes from "./routes/giftRoutes.js";
import path from "path";
import { fileURLToPath } from "url"; // ← ADD THIS




dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use(express.json({ limit: "10mb" })); // For JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // ADD THIS

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/offers', offerRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/dashboard", dashboardRoutes);  // Or adjust path if preferred
app.use("/api/gifts", giftRoutes);



// Sample route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// DB + Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

