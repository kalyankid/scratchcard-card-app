import mongoose from "mongoose";

const scratchPackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  roleAllowed: [{ type: String, enum: ["retailer", "distributor", "master_distributor"] }],
  giftCount: { type: Number, required: true }, // how many gift cards per package
}, { timestamps: true });

export default mongoose.model("ScratchPackage", scratchPackageSchema);
