import mongoose, { Schema } from "mongoose";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { IEnablementPolicyDocument } from "./enablement-policies-db-interface";
import { PolicyStatus } from "@/core/enablement/types/policy";

const enablementPolicySchema = new Schema<IEnablementPolicyDocument>(
  {
    entity_type: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    status: {
      type: String,
      enum: Object.values(PolicyStatus),
      default: PolicyStatus.DRAFT,
      index: true,
    },
    rules: {
      type: Schema.Types.Mixed,
      required: true,
    },
    effective_from: {
      type: Date,
      default: null,
    },
    effective_until: {
      type: Date,
      default: null,
    },
    ...CommonServiceFieldsModel,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

enablementPolicySchema.index({ entity_type: 1, version: 1 }, { unique: true });

enablementPolicySchema.plugin(auditPlugin);

enablementPolicySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const EnablementPolicyModel = mongoose.model<IEnablementPolicyDocument>(
  tableName.EnablementPolicies,
  enablementPolicySchema
);

export default EnablementPolicyModel;
export { IEnablementPolicyDocument };
