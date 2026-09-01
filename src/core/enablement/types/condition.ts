import { ConditionResult } from "./rule-result";

export type ParameterType = "string" | "number" | "boolean" | "array" | "object";

export interface ParameterSchema {
  type: ParameterType;
  label?: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  minimum?: number;
  maximum?: number;
  enum?: (string | number)[];
}

export interface ConditionMetadata {
  type: string;
  label: string;
  description: string;
  applicableEntityTypes: string[]; // e.g. ["COUNTRY", "REGION"] or ["*"]
  parameters: Record<string, ParameterSchema>;
}

export interface ConditionEvaluator<T = any> {
  readonly type: string;
  readonly metadata: ConditionMetadata;

  evaluate(
    entity: T,
    params?: Record<string, unknown>,
  ): Promise<ConditionResult>;
}
