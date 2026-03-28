import mongoose from "mongoose";

const userGiftSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  gifts: [
    {
      name: { type: String, required: true }, // e.g., "50 rupees" or "Fridge"
      quantity: { type: Number, required: true, min: 1 } // Number of this gift
    }
  ], // Array of objects
}, { timestamps: true });

export default mongoose.model("UserGift", userGiftSchema);