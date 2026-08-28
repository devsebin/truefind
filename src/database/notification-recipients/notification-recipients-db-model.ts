import mongoose, { Schema } from "mongoose";
import {
  INotificationRecipient,
  NotificationRecipientStatus,
} from "./notification-recipients-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";

const notificationRecipientSchema = new Schema<INotificationRecipient>(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Notifications,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.User,
      required: true,
      index: true,
    },
    suburbId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Suburbs,
      required: false,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(NotificationRecipientStatus),
      default: NotificationRecipientStatus.PENDING,
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

notificationRecipientSchema.index(
  { notificationId: 1, userId: 1 },
  { unique: true },
);
notificationRecipientSchema.index({ userId: 1, status: 1 });
notificationRecipientSchema.index({ status: 1, createdAt: 1 });

const NotificationRecipientModel = mongoose.model<INotificationRecipient>(
  "NotificationRecipient",
  notificationRecipientSchema,
  tableName.NotificationRecipients,
);

export default NotificationRecipientModel;
