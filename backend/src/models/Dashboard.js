import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  id: String,          // unique card id
  prize: String,       // e.g., "₹50 cashback", "Better luck next time"
  scratched: Boolean,  // whether user scratched it
});

const dashboardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    purchasedCards: [cardSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Dashboard", dashboardSchema);
