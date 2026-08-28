import { Document, Types } from "mongoose";

export enum NotificationRecipientStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  FAILED = "FAILED",
  READ = "READ",
}

export interface INotificationRecipient extends Document {
  notificationId: Types.ObjectId;
  userId: Types.ObjectId;
  suburbId?: Types.ObjectId;
  status: NotificationRecipientStatus;
  sentAt?: Date | null;
  readAt?: Date | null;
  failureReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
