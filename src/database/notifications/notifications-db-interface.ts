import { Document, Types } from "mongoose";
import { moduleTypes } from "@/utils/definitions/constants/modules";

export enum NotificationType {
  BUNDLE_APPROVED = "BUNDLE_APPROVED",
  SERVICE_APPROVED = "SERVICE_APPROVED",
  BOOKING_CONFIRMED = "BOOKING_CONFIRMED",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  GENERAL = "GENERAL",
}

export interface INotificationMetadata {
  bundleId?: Types.ObjectId;
  bundleName?: string;
  serviceIds?: Types.ObjectId[];
  eventId?: string;
  [key: string]: any;
}

export interface INotification extends Document {
  type: NotificationType | string;
  title: string;
  message: string;
  module?: moduleTypes | string;
  entityType?: string;
  entityId?: Types.ObjectId;
  suburbId?: Types.ObjectId;
  createdBy?: Types.ObjectId;
  metadata?: INotificationMetadata;
  createdAt: Date;
  updatedAt: Date;
}
