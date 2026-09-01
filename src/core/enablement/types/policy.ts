import { RuleNode } from "./rule-node";

export enum PolicyStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export enum PolicyAuditAction {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  VALIDATED = "VALIDATED",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
  ROLLED_BACK = "ROLLED_BACK",
}

export interface IEnablementPolicyData {
  id?: string;
  entity_type: string;
  name: string;
  description?: string;
  version: number;
  status: PolicyStatus;
  rules: RuleNode;
  effective_from?: Date | null;
  effective_until?: Date | null;
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}
