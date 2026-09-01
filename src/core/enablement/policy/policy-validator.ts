import { ConditionRegistry, conditionRegistry } from "../registry/condition-registry";
import { ParameterSchema } from "../types/condition";
import {
  ConditionNode,
  GroupNode,
  RuleNode,
  isConditionNode,
  isGroupNode,
} from "../types/rule-node";

export interface PolicyValidationError {
  path: string;
  code: string;
  message: string;
}

export interface PolicyValidationResult {
  valid: boolean;
  errors: PolicyValidationError[];
}

export class PolicyValidator {
  constructor(private registry: ConditionRegistry = conditionRegistry) {}

  public validate(
    rules: RuleNode,
    entityType?: string,
    options?: { maxDepth?: number }
  ): PolicyValidationResult {
    const errors: PolicyValidationError[] = [];
    const maxDepth = options?.maxDepth || 10;

    if (!rules || typeof rules !== "object") {
      errors.push({
        path: "rules",
        code: "INVALID_RULE_STRUCTURE",
        message: "Rules definition must be a valid JSON object",
      });
      return { valid: false, errors };
    }

    this.validateNode(rules, "rules", errors, 0, maxDepth, entityType);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validateNode(
    node: any,
    path: string,
    errors: PolicyValidationError[],
    depth: number,
    maxDepth: number,
    entityType?: string
  ): void {
    if (depth > maxDepth) {
      errors.push({
        path,
        code: "MAX_DEPTH_EXCEEDED",
        message: `Rule tree exceeds maximum nesting depth of ${maxDepth}`,
      });
      return;
    }

    if (!node || typeof node !== "object") {
      errors.push({
        path,
        code: "INVALID_NODE",
        message: "Node must be an object",
      });
      return;
    }

    if (node.kind === "CONDITION") {
      this.validateConditionNode(node as ConditionNode, path, errors, entityType);
    } else if (node.kind === "GROUP") {
      this.validateGroupNode(node as GroupNode, path, errors, depth, maxDepth, entityType);
    } else {
      errors.push({
        path: `${path}.kind`,
        code: "INVALID_NODE_KIND",
        message: `Node kind must be 'CONDITION' or 'GROUP', got '${node.kind}'`,
      });
    }
  }

  private validateConditionNode(
    node: ConditionNode,
    path: string,
    errors: PolicyValidationError[],
    entityType?: string
  ): void {
    if (!node.type || typeof node.type !== "string") {
      errors.push({
        path: `${path}.type`,
        code: "MISSING_CONDITION_TYPE",
        message: "Condition node must have a string 'type'",
      });
      return;
    }

    const evaluator = this.registry.get(node.type);
    if (!evaluator) {
      errors.push({
        path: `${path}.type`,
        code: "UNKNOWN_CONDITION",
        message: `Condition '${node.type}' is not registered`,
      });
      return;
    }

    const metadata = evaluator.metadata;
    if (entityType && metadata.applicableEntityTypes) {
      const applies =
        metadata.applicableEntityTypes.includes("*") ||
        metadata.applicableEntityTypes.includes(entityType.toUpperCase());
      if (!applies) {
        errors.push({
          path: `${path}.type`,
          code: "UNSUPPORTED_CONDITION_FOR_ENTITY",
          message: `Condition '${node.type}' is not supported for entity type '${entityType}'`,
        });
      }
    }

    const params = node.params || {};
    if (typeof params !== "object" || Array.isArray(params)) {
      errors.push({
        path: `${path}.params`,
        code: "INVALID_PARAMS_FORMAT",
        message: "Condition params must be an object map",
      });
      return;
    }

    const schemaMap = metadata.parameters || {};
    for (const [paramName, schema] of Object.entries(schemaMap)) {
      const val = params[paramName];
      this.validateParameter(val, schema, `${path}.params.${paramName}`, errors);
    }
  }

  private validateParameter(
    value: unknown,
    schema: ParameterSchema,
    paramPath: string,
    errors: PolicyValidationError[]
  ): void {
    if (value === undefined || value === null) {
      if (schema.required) {
        errors.push({
          path: paramPath,
          code: "REQUIRED_PARAMETER_MISSING",
          message: `Parameter is required`,
        });
      }
      return;
    }

    if (schema.type === "number") {
      if (typeof value !== "number" || isNaN(value)) {
        errors.push({
          path: paramPath,
          code: "INVALID_PARAMETER_TYPE",
          message: `Expected type number, got ${typeof value}`,
        });
        return;
      }
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push({
          path: paramPath,
          code: "PARAMETER_OUT_OF_RANGE",
          message: `Value ${value} is less than minimum allowed ${schema.minimum}`,
        });
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push({
          path: paramPath,
          code: "PARAMETER_OUT_OF_RANGE",
          message: `Value ${value} is greater than maximum allowed ${schema.maximum}`,
        });
      }
    } else if (schema.type === "string") {
      if (typeof value !== "string") {
        errors.push({
          path: paramPath,
          code: "INVALID_PARAMETER_TYPE",
          message: `Expected type string, got ${typeof value}`,
        });
        return;
      }
      if (schema.enum && !schema.enum.includes(value)) {
        errors.push({
          path: paramPath,
          code: "INVALID_ENUM_VALUE",
          message: `Value '${value}' is not in allowed list [${schema.enum.join(", ")}]`,
        });
      }
    } else if (schema.type === "boolean") {
      if (typeof value !== "boolean") {
        errors.push({
          path: paramPath,
          code: "INVALID_PARAMETER_TYPE",
          message: `Expected type boolean, got ${typeof value}`,
        });
      }
    } else if (schema.type === "array") {
      if (!Array.isArray(value)) {
        errors.push({
          path: paramPath,
          code: "INVALID_PARAMETER_TYPE",
          message: `Expected type array, got ${typeof value}`,
        });
      }
    }
  }

  private validateGroupNode(
    node: GroupNode,
    path: string,
    errors: PolicyValidationError[],
    depth: number,
    maxDepth: number,
    entityType?: string
  ): void {
    const validOperators = ["AND", "OR", "NOT"];
    if (!node.operator || !validOperators.includes(node.operator)) {
      errors.push({
        path: `${path}.operator`,
        code: "INVALID_OPERATOR",
        message: `Group operator must be one of: ${validOperators.join(", ")}`,
      });
    }

    if (!Array.isArray(node.children)) {
      errors.push({
        path: `${path}.children`,
        code: "INVALID_CHILDREN_FORMAT",
        message: "Group children must be an array of rule nodes",
      });
      return;
    }

    if (node.operator === "NOT") {
      if (node.children.length !== 1) {
        errors.push({
          path: `${path}.children`,
          code: "INVALID_NOT_CHILDREN_COUNT",
          message: `NOT group operator requires exactly 1 child, got ${node.children.length}`,
        });
      }
    } else if (node.children.length === 0) {
      errors.push({
        path: `${path}.children`,
        code: "EMPTY_GROUP",
        message: "Logical group must contain at least one child rule",
      });
    }

    node.children.forEach((child, index) => {
      this.validateNode(child, `${path}.children[${index}]`, errors, depth + 1, maxDepth, entityType);
    });
  }
}

export const policyValidator = new PolicyValidator();
