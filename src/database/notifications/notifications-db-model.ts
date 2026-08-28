import mongoose, { Schema } from "mongoose";
import { INotification, NotificationType } from "./notifications-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { moduleTypes } from "@/utils/definitions/constants/modules";

const notificationSchema = new Schema<INotification>(
  {
    type: {
      type: String,
      required: true,
      index: true,
      default: NotificationType.GENERAL,
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
    module: {
      type: String,
      enum: Object.values(moduleTypes),
      required: false,
      index: true,
    },
    entityType: {
      type: String,
      required: false,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

notificationSchema.index({ entityId: 1, entityType: 1 });
notificationSchema.index({ module: 1, type: 1 });
notificationSchema.index({ suburbId: 1, createdAt: -1 });

const NotificationModel = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
  tableName.Notifications,
);

export default NotificationModel;
