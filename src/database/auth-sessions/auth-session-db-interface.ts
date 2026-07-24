import { Types } from "mongoose";

export interface IAuthSession {
  userId: Types.ObjectId;

  // token
  refreshTokenHash: string;
  tokenId: string; // jti

  // device identity (important)
  deviceId: string; // generated UUID from frontend
  deviceName?: string; // "John's iPhone", "Chrome on Windows"

  device: {
    userAgent: string;
    browser?: string;
    os?: string;
    deviceType?: "mobile" | "desktop" | "tablet";
  };

  ipAddress: string;

  location?: {
    country?: string;
    city?: string;
  };

  // lifecycle
  isRevoked: boolean;
  revokedAt?: Date;
  expiresAt: Date;

  // tracking
  createdAt: Date;
  lastUsedAt?: Date;
}
