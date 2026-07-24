import mongoose, { model, Schema } from "mongoose";
import { IAuthSession } from "./auth-session-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";

const RefreshSessionSchema = new Schema<IAuthSession>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.User,
      required: true,
      index: true,
    },

    refreshTokenHash: {
      type: String,
      required: true,
    },

    tokenId: {
      type: String,
      required: true,
      index: true,
    },

    deviceId: {
      type: String,
      required: true,
      index: true,
    },

    deviceName: {
      type: String,
    },

    device: {
      userAgent: { type: String, required: true },
      browser: { type: String },
      os: { type: String },
      deviceType: {
        type: String,
        enum: ["mobile", "desktop", "tablet"],
      },
    },

    ipAddress: {
      type: String,
      required: true,
    },

    location: {
      country: { type: String },
      city: { type: String },
    },

    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },

    revokedAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    lastUsedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

RefreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

RefreshSessionSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

RefreshSessionSchema.index({ tokenId: 1, isRevoked: 1 });

const RefreshSessionModel = model<IAuthSession>(
  tableName.RefreshSessions,
  RefreshSessionSchema,
);

export default RefreshSessionModel;
