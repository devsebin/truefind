import { LogicalOperator } from "./rule-node";

export interface ConditionResult {
  passed: boolean;
  type?: string;
  code?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface ConditionRuleResult {
  kind: "CONDITION";
  type: string;
  passed: boolean;
  code?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface GroupRuleResult {
  kind: "GROUP";
  operator: LogicalOperator;
  passed: boolean;
  children: RuleResult[];
}

export type RuleResult = ConditionRuleResult | GroupRuleResult;

export interface RuleEvaluationResult {
  passed: boolean;
  policyId?: string;
  policyVersion?: number;
  result: RuleResult;
  failureReasons: ConditionResult[];
}
