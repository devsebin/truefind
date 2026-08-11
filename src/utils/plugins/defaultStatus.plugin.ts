// plugins/defaultStatus.plugin.ts
import StatusModel from "../../database/status/status-db-model";
import { Schema } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "../helpers/response-builder";

let cachedDefaultStatusId: any = null;

async function getDefaultStatusId() {
  if (cachedDefaultStatusId) {
    const exists = await StatusModel.exists({
      _id: cachedDefaultStatusId,
      is_deleted: false,
      is_active: true,
    });
    if (exists) {
      return cachedDefaultStatusId;
    }
    cachedDefaultStatusId = null;
  }

  const defaultStatus = await StatusModel.findOne({
    is_default: true,
    is_deleted: false,
    is_active: true,
  }).lean();

  if (!defaultStatus) {
    const newStatus = await StatusModel.create({
      title: "Active",
      label: "active",
      color: "#00FF00",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });
    cachedDefaultStatusId = newStatus._id;
    return cachedDefaultStatusId;
  }

  cachedDefaultStatusId = defaultStatus._id;

  return cachedDefaultStatusId;
}

export function defaultStatusPlugin(schema: Schema) {
  schema.pre("validate", async function (this: any) {
    if (!this.status_id) {
      this.status_id = await getDefaultStatusId();
    }
  });
}
