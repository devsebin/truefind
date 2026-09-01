import { PolicyValidator } from "@/core/enablement/policy/policy-validator";
import { ConditionRegistry } from "@/core/enablement/registry/condition-registry";
import { RuleNode } from "@/core/enablement/types/rule-node";

describe("PolicyValidator Unit Tests", () => {
  let registry: ConditionRegistry;
  let validator: PolicyValidator;

  beforeEach(() => {
    registry = ConditionRegistry.getInstance();
    registry.clear();
    registry.register({
      type: "HAS_ACTIVE_REGION",
      metadata: {
        type: "HAS_ACTIVE_REGION",
        label: "Has Active Region",
        description: "Checks active regions",
        applicableEntityTypes: ["COUNTRY"],
        parameters: {
          minimum: {
            type: "number",
            minimum: 1,
            maximum: 100,
            required: false,
          },
        },
      },
      evaluate: async () => ({ passed: true }),
    });
    validator = new PolicyValidator(registry);
  });

  it("should validate a valid policy rule tree", () => {
    const validRule: RuleNode = {
      kind: "GROUP",
      operator: "AND",
      children: [
        {
          kind: "CONDITION",
          type: "HAS_ACTIVE_REGION",
          params: { minimum: 2 },
        },
      ],
    };

    const res = validator.validate(validRule, "COUNTRY");
    expect(res.valid).toBe(true);
    expect(res.errors.length).toBe(0);
  });

  it("should reject unknown condition types", () => {
    const invalidRule: RuleNode = {
      kind: "CONDITION",
      type: "UNKNOWN_TYPE",
    };

    const res = validator.validate(invalidRule, "COUNTRY");
    expect(res.valid).toBe(false);
    expect(res.errors[0].code).toBe("UNKNOWN_CONDITION");
  });

  it("should reject condition not applicable to entity type", () => {
    const rule: RuleNode = {
      kind: "CONDITION",
      type: "HAS_ACTIVE_REGION",
    };

    const res = validator.validate(rule, "PROVIDER");
    expect(res.valid).toBe(false);
    expect(res.errors[0].code).toBe("UNSUPPORTED_CONDITION_FOR_ENTITY");
  });

  it("should reject parameter violating minimum bounds", () => {
    const rule: RuleNode = {
      kind: "CONDITION",
      type: "HAS_ACTIVE_REGION",
      params: { minimum: -5 },
    };

    const res = validator.validate(rule, "COUNTRY");
    expect(res.valid).toBe(false);
    expect(res.errors[0].code).toBe("PARAMETER_OUT_OF_RANGE");
  });

  it("should reject empty GROUP nodes", () => {
    const emptyGroup: RuleNode = {
      kind: "GROUP",
      operator: "AND",
      children: [],
    };

    const res = validator.validate(emptyGroup, "COUNTRY");
    expect(res.valid).toBe(false);
    expect(res.errors[0].code).toBe("EMPTY_GROUP");
  });

  it("should reject NOT operator with multiple children", () => {
    const invalidNot: RuleNode = {
      kind: "GROUP",
      operator: "NOT",
      children: [
        { kind: "CONDITION", type: "HAS_ACTIVE_REGION" },
        { kind: "CONDITION", type: "HAS_ACTIVE_REGION" },
      ],
    };

    const res = validator.validate(invalidNot, "COUNTRY");
    expect(res.valid).toBe(false);
    expect(res.errors[0].code).toBe("INVALID_NOT_CHILDREN_COUNT");
  });
});
