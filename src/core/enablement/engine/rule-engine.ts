import { ConditionRegistry, conditionRegistry } from "../registry/condition-registry";
import {
  ConditionNode,
  GroupNode,
  RuleNode,
  isConditionNode,
  isGroupNode,
} from "../types/rule-node";
import {
  ConditionResult,
  RuleEvaluationResult,
  RuleResult,
} from "../types/rule-result";

export class RuleEngine {
  constructor(private registry: ConditionRegistry = conditionRegistry) {}

  public async evaluate<T = any>(
    rootNode: RuleNode,
    entity: T,
    options?: { policyId?: string; policyVersion?: number }
  ): Promise<RuleEvaluationResult> {
    const failureReasons: ConditionResult[] = [];
    const result = await this.evaluateNode(rootNode, entity, failureReasons);

    return {
      passed: result.passed,
      policyId: options?.policyId,
      policyVersion: options?.policyVersion,
      result,
      failureReasons,
    };
  }

  private async evaluateNode<T>(
    node: RuleNode,
    entity: T,
    failureReasons: ConditionResult[]
  ): Promise<RuleResult> {
    if (isConditionNode(node)) {
      return this.evaluateCondition(node, entity, failureReasons);
    }

    if (isGroupNode(node)) {
      return this.evaluateGroup(node, entity, failureReasons);
    }

    throw new Error(`Unknown rule node kind: ${(node as any)?.kind}`);
  }

  private async evaluateCondition<T>(
    node: ConditionNode,
    entity: T,
    failureReasons: ConditionResult[]
  ): Promise<RuleResult> {
    const evaluator = this.registry.get(node.type);
    if (!evaluator) {
      const errorResult: ConditionResult = {
        passed: false,
        type: node.type,
        code: "UNKNOWN_CONDITION",
        message: `Condition evaluator for type '${node.type}' is not registered`,
        metadata: { conditionType: node.type },
      };
      failureReasons.push(errorResult);
      return {
        kind: "CONDITION",
        type: node.type,
        passed: false,
        code: errorResult.code,
        message: errorResult.message,
        metadata: errorResult.metadata,
      };
    }

    try {
      const res = await evaluator.evaluate(entity, node.params || {});
      const passed = Boolean(res.passed);
      const conditionResult: ConditionResult = {
        passed,
        type: node.type,
        code: res.code || node.type,
        message: res.message,
        metadata: res.metadata,
      };

      if (!passed) {
        failureReasons.push(conditionResult);
      }

      return {
        kind: "CONDITION",
        type: node.type,
        passed,
        code: conditionResult.code,
        message: conditionResult.message,
        metadata: conditionResult.metadata,
      };
    } catch (err: any) {
      const errorResult: ConditionResult = {
        passed: false,
        type: node.type,
        code: "CONDITION_EXECUTION_ERROR",
        message: err?.message || `Failed to execute condition '${node.type}'`,
        metadata: { error: String(err) },
      };
      failureReasons.push(errorResult);
      return {
        kind: "CONDITION",
        type: node.type,
        passed: false,
        code: errorResult.code,
        message: errorResult.message,
        metadata: errorResult.metadata,
      };
    }
  }

  private async evaluateGroup<T>(
    node: GroupNode,
    entity: T,
    failureReasons: ConditionResult[]
  ): Promise<RuleResult> {
    const operator = node.operator;
    const children = node.children || [];

    if (operator === "NOT") {
      if (children.length !== 1) {
        throw new Error(`NOT operator group must have exactly 1 child, received ${children.length}`);
      }
      const childFailureReasons: ConditionResult[] = [];
      const childResult = await this.evaluateNode(children[0], entity, childFailureReasons);
      const passed = !childResult.passed;

      if (!passed) {
        failureReasons.push({
          passed: false,
          code: "NOT_CONDITION_FAILED",
          message: "Negated condition evaluated to true",
        });
      }

      return {
        kind: "GROUP",
        operator: "NOT",
        passed,
        children: [childResult],
      };
    }

    if (operator === "AND") {
      const childResults: RuleResult[] = [];
      let allPassed = true;

      for (const child of children) {
        const childRes = await this.evaluateNode(child, entity, failureReasons);
        childResults.push(childRes);
        if (!childRes.passed) {
          allPassed = false;
        }
      }

      return {
        kind: "GROUP",
        operator: "AND",
        passed: allPassed,
        children: childResults,
      };
    }

    if (operator === "OR") {
      const childResults: RuleResult[] = [];
      let anyPassed = false;
      const groupFailureReasons: ConditionResult[] = [];

      for (const child of children) {
        const childRes = await this.evaluateNode(child, entity, groupFailureReasons);
        childResults.push(childRes);
        if (childRes.passed) {
          anyPassed = true;
        }
      }

      if (!anyPassed) {
        failureReasons.push(...groupFailureReasons);
      }

      return {
        kind: "GROUP",
        operator: "OR",
        passed: anyPassed,
        children: childResults,
      };
    }

    throw new Error(`Unsupported logical operator: ${operator}`);
  }
}

export const ruleEngine = new RuleEngine();
