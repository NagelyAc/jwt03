import mongoose from "mongoose";

import User from "./user.model.js";
import RefreshToken from "./refreshToken.model.js";

const db = {
  mongoose,
  user: User,
  refreshToken: RefreshToken,
  ROLES: ["user", "admin", "moderator"],
};

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  await mongoose.connect(mongoUri);
};

export default db;
