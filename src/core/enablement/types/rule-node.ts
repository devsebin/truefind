export type LogicalOperator = "AND" | "OR" | "NOT";

export type RuleNodeKind = "CONDITION" | "GROUP";

export interface ConditionNode {
  kind: "CONDITION";
  type: string;
  params?: Record<string, unknown>;
}

export interface GroupNode {
  kind: "GROUP";
  operator: LogicalOperator;
  children: RuleNode[];
}

export type RuleNode = ConditionNode | GroupNode;

export function isConditionNode(node: RuleNode): node is ConditionNode {
  return (node as ConditionNode).kind === "CONDITION";
}

export function isGroupNode(node: RuleNode): node is GroupNode {
  return (node as GroupNode).kind === "GROUP";
}
