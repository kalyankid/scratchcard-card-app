import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true }, // Added
  lastName: { type: String, required: true }, // Added
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  role: { type: String, enum: ["retailer", "distributor", "master_distributor"], default: "retailer" },
  banners: [{ type: String }],
  profileImage: { type: String, default: "" },
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function(next) {
  if (this.isModified("passwordHash")) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("User", userSchema);