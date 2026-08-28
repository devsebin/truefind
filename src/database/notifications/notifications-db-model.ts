import mongoose, { Schema } from "mongoose";
import { INotification, NotificationType } from "./notifications-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";

const notificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      default: NotificationType.BUNDLE_APPROVED,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    bundleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Bundles,
      required: false,
      index: true,
    },
    suburbId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.Suburbs,
      required: false,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableName.User,
      required: false,
    },
    metadata: {
      bundleName: { type: String },
      serviceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: tableName.Services }],
      eventId: { type: String, index: true },
    },
  },
  { timestamps: true },
);

notificationSchema.index({ bundleId: 1, type: 1 });
notificationSchema.index({ suburbId: 1, createdAt: -1 });

const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
  tableName.Notifications,
);

export default NotificationModel;
