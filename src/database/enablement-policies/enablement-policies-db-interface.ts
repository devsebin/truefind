import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { RuleNode } from "@/core/enablement/types/rule-node";
import { PolicyStatus } from "@/core/enablement/types/policy";
import { Document } from "mongoose";

export interface IEnablementPolicy extends CommonServiceFieldsInterface {
  entity_type: string;
  name: string;
  description?: string;
  version: number;
  status: PolicyStatus;
  rules: RuleNode;
  effective_from?: Date | null;
  effective_until?: Date | null;
}

export interface IEnablementPolicyDocument extends IEnablementPolicy, Document {}
