import mongoose from "mongoose";
import { TIME_SERIES_AGGREGATION_TYPE } from "redis";

const tokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    jti: { type: String, required: true },
    expiresIn: { type: Date, required: true },
  },
  {
    timestamps: true,
  },
);
tokenSchema.index("expiresIn", { expireAfterSeconds: 0 });
export const tokenModel =
  mongoose.models.Token || mongoose.model("Token", tokenSchema);
