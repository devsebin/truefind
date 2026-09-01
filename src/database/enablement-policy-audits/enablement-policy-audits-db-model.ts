import mongoose, { Schema } from "mongoose";
import { tableName } from "@/utils/definitions/constants/table-names";
import { PolicyAuditAction } from "@/core/enablement/types/policy";
import { IEnablementPolicyAuditDocument } from "./enablement-policy-audits-db-interface";

const enablementPolicyAuditSchema = new Schema<IEnablementPolicyAuditDocument>(
  {
    policy_id: {
      type: Schema.Types.ObjectId,
      ref: tableName.EnablementPolicies,
      required: true,
      index: true,
    },
    entity_type: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },
    version: {
      type: Number,
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(PolicyAuditAction),
      required: true,
    },
    performed_by: {
      type: Schema.Types.ObjectId,
      ref: tableName.User,
      default: null,
    },
    previous_version: {
      type: Number,
      default: null,
    },
    new_version: {
      type: Number,
      default: null,
    },
    rules_snapshot: {
      type: Schema.Types.Mixed,
      default: null,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

enablementPolicyAuditSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const EnablementPolicyAuditModel = mongoose.model<IEnablementPolicyAuditDocument>(
  tableName.EnablementPolicyAudits,
  enablementPolicyAuditSchema
);

export default EnablementPolicyAuditModel;
export { IEnablementPolicyAuditDocument };
