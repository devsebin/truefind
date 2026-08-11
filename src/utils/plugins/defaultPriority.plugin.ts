// plugins/defaultStatus.plugin.ts
import PriorityModel from "../../database/priority/priority-db-model";
import { Schema } from "mongoose";

let cachedDefaultStatusId: any = null;

async function getDefaultStatusId() {
  if (cachedDefaultStatusId) {
    return cachedDefaultStatusId;
  }
  const defaultStatus = await PriorityModel.findOne({
    is_default: true,
    is_deleted: false,
  }).lean();

  if (!defaultStatus) {
    const newPriority = await PriorityModel.create({
      title: "medium",
      label: "Medium",
      color: "#808080",
      is_default: true,
      is_deleted: false,
      is_active: true,
    });
    cachedDefaultStatusId = newPriority._id;
    return cachedDefaultStatusId;
  }

  cachedDefaultStatusId = defaultStatus._id;

  return cachedDefaultStatusId;
}

export function defaultPriorityPlugin(schema: Schema) {
  schema.pre("save", async function (this: any) {
    if (!this.priority_id) {
      this.priority_id = await getDefaultStatusId();
    }
  });
}
