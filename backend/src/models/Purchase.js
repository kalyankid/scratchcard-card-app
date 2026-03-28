import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: "Offer", required: true },
  price: { type: Number, required: true },
  totalCards: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["pending", "verified", "rejected"], 
    default: "pending" 
  },
  paymentScreenshot: { type: String }, 
});

export default mongoose.model("Purchase", purchaseSchema);