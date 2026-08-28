import mongoose, { Schema } from "mongoose";
import {
  INotificationTemplate,
  NotificationChannel,
} from "./notification-templates-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";

const notificationTemplateSchema = new Schema<INotificationTemplate>(
  {
    type: {
      type: String,
      required: true,
      index: true,
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
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      default: NotificationChannel.IN_APP,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const NotificationTemplateModel = mongoose.model<INotificationTemplate>(
  "NotificationTemplate",
  notificationTemplateSchema,
  tableName.NotificationTemplates,
);

export default NotificationTemplateModel;
