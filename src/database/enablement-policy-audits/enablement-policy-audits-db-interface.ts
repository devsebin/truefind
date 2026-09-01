import { PolicyAuditAction } from "@/core/enablement/types/policy";
import { Types, Document } from "mongoose";

export interface IEnablementPolicyAudit {
  policy_id: Types.ObjectId;
  entity_type: string;
  version: number;
  action: PolicyAuditAction;
  performed_by?: Types.ObjectId;
  previous_version?: number;
  new_version?: number;
  rules_snapshot?: any;
  notes?: string;
  created_at?: Date;
}

export interface IEnablementPolicyAuditDocument extends IEnablementPolicyAudit, Document {}
