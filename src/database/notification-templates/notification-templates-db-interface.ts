import { Document } from "mongoose";

export enum NotificationChannel {
  IN_APP = "IN_APP",
  PUSH = "PUSH",
  EMAIL = "EMAIL",
  SMS = "SMS",
}

export interface INotificationTemplate extends Document {
  type: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
