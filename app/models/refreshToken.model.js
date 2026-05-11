import crypto from "crypto";
import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.statics.createToken = async function createToken(user) {
  const expiredAt = new Date();

  expiredAt.setSeconds(
    expiredAt.getSeconds() + Number(process.env.JWT_REFRESH_EXPIRATION || 86400)
  );

  const refreshToken = await this.create({
    token: crypto.randomUUID(),
    userId: user._id,
    expiryDate: expiredAt,
  });

  return refreshToken.token;
};

refreshTokenSchema.statics.verifyExpiration = function verifyExpiration(token) {
  return token.expiryDate.getTime() < new Date().getTime();
};

export default mongoose.model("RefreshToken", refreshTokenSchema);
