import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  role: { type: String, enum: ['retailer', 'distributor', 'master_distributor'], required: true },
  price: { type: Number, required: true },
  cards: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Offer', offerSchema);
