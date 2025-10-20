import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    jti: { type: String, required: true, unique: true, index: true },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("RefreshToken", RefreshTokenSchema);
