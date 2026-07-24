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
    throw new Error("Default status not found");
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
