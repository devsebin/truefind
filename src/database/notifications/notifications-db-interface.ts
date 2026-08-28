import { Document, Types } from "mongoose";

export enum NotificationType {
  BUNDLE_APPROVED = "BUNDLE_APPROVED",
}

export interface INotificationMetadata {
  bundleName?: string;
  serviceIds?: Types.ObjectId[];
  eventId?: string;
  [key: string]: any;
}

export interface INotification extends Document {
  type: NotificationType | string;
  title: string;
  message: string;
  bundleId?: Types.ObjectId;
  suburbId?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  metadata?: INotificationMetadata;
  createdAt: Date;
  updatedAt: Date;
}
