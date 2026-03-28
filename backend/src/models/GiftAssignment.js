import mongoose from "mongoose";

const giftAssignmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase" },
  gifts: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      imageUrl: { type: String }, // ← NEW: Optional image
    },
  ],
  mode: { 
    type: String, 
    enum: ["add", "reassign"], 
    default: "add", // ← FIXED
    required: true 
  },
  assignedCount: { type: Number, required: true },
  fallbackFilled: { type: Number, default: 0 },
  assignedAt: { type: Date, default: Date.now },
});

export default mongoose.model("GiftAssignment", giftAssignmentSchema);