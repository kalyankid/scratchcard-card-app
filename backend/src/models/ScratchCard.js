import mongoose from "mongoose";

const scratchCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  purchaseId: { type: mongoose.Schema.Types.ObjectId, ref: "Purchase", required: true },
  prize: { type: String, default: null }, // Changed: Nullable until assigned
  scratched: { type: Boolean, default: false },
  scratchedAt: { type: Date },
  giftImageUrl: { type: String },
}, { timestamps: true });

export default mongoose.model("ScratchCard", scratchCardSchema);