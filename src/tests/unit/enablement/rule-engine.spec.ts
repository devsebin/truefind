import { RuleEngine } from "@/core/enablement/engine/rule-engine";
import { ConditionRegistry } from "@/core/enablement/registry/condition-registry";
import { ConditionEvaluator } from "@/core/enablement/types/condition";
import { RuleNode } from "@/core/enablement/types/rule-node";

describe("RuleEngine Unit Tests", () => {
  let registry: ConditionRegistry;
  let engine: RuleEngine;

  const mockPassEvaluator: ConditionEvaluator = {
    type: "MOCK_PASS",
    metadata: {
      type: "MOCK_PASS",
      label: "Mock Pass",
      description: "Always passes",
      applicableEntityTypes: ["*"],
      parameters: {},
    },
    evaluate: async () => ({
      passed: true,
      message: "Condition passed",
      metadata: { score: 100 },
    }),
  };

  const mockFailEvaluator: ConditionEvaluator = {
    type: "MOCK_FAIL",
    metadata: {
      type: "MOCK_FAIL",
      label: "Mock Fail",
      description: "Always fails",
      applicableEntityTypes: ["*"],
      parameters: {},
    },
    evaluate: async (_entity: any, params?: Record<string, any>) => ({
      passed: false,
      code: "MOCK_FAIL",
      message: (params?.reason as string) || "Condition failed",
      metadata: { score: 0 },
    }),
  };

  beforeEach(() => {
    registry = ConditionRegistry.getInstance();
    registry.clear();
    registry.register(mockPassEvaluator);
    registry.register(mockFailEvaluator);
    engine = new RuleEngine(registry);
  });

  it("should evaluate a single passing CONDITION node", async () => {
    const rule: RuleNode = {
      kind: "CONDITION",
      type: "MOCK_PASS",
    };

    const result = await engine.evaluate(rule, {});
    expect(result.passed).toBe(true);
    expect(result.failureReasons.length).toBe(0);
    expect(result.result.kind).toBe("CONDITION");
  });

  it("should evaluate a single failing CONDITION node", async () => {
    const rule: RuleNode = {
      kind: "CONDITION",
      type: "MOCK_FAIL",
      params: { reason: "Explicit fail" },
    };

    const result = await engine.evaluate(rule, {});
    expect(result.passed).toBe(false);
    expect(result.failureReasons.length).toBe(1);
    expect(result.failureReasons[0].code).toBe("MOCK_FAIL");
    expect(result.failureReasons[0].message).toBe("Explicit fail");
  });

  it("should fail gracefully when an unknown condition is evaluated", async () => {
    const rule: RuleNode = {
      kind: "CONDITION",
      type: "NON_EXISTENT_CONDITION",
    };

    const result = await engine.evaluate(rule, {});
    expect(result.passed).toBe(false);
    expect(result.failureReasons[0].code).toBe("UNKNOWN_CONDITION");
  });

  it("should correctly evaluate AND logical groups", async () => {
    const passingAnd: RuleNode = {
      kind: "GROUP",
      operator: "AND",
      children: [
        { kind: "CONDITION", type: "MOCK_PASS" },
        { kind: "CONDITION", type: "MOCK_PASS" },
      ],
    };
    const passRes = await engine.evaluate(passingAnd, {});
    expect(passRes.passed).toBe(true);

    const failingAnd: RuleNode = {
      kind: "GROUP",
      operator: "AND",
      children: [
        { kind: "CONDITION", type: "MOCK_PASS" },
        { kind: "CONDITION", type: "MOCK_FAIL" },
      ],
    };
    const failRes = await engine.evaluate(failingAnd, {});
    expect(failRes.passed).toBe(false);
    expect(failRes.failureReasons.length).toBe(1);
  });

  it("should correctly evaluate OR logical groups", async () => {
    const passingOr: RuleNode = {
      kind: "GROUP",
      operator: "OR",
      children: [
        { kind: "CONDITION", type: "MOCK_FAIL" },
        { kind: "CONDITION", type: "MOCK_PASS" },
      ],
    };
    const passRes = await engine.evaluate(passingOr, {});
    expect(passRes.passed).toBe(true);
    expect(passRes.failureReasons.length).toBe(0);

    const failingOr: RuleNode = {
      kind: "GROUP",
      operator: "OR",
      children: [
        { kind: "CONDITION", type: "MOCK_FAIL" },
        { kind: "CONDITION", type: "MOCK_FAIL" },
      ],
    };
    const failRes = await engine.evaluate(failingOr, {});
    expect(failRes.passed).toBe(false);
    expect(failRes.failureReasons.length).toBe(2);
  });

  it("should correctly evaluate NOT logical groups", async () => {
    const notPass: RuleNode = {
      kind: "GROUP",
      operator: "NOT",
      children: [{ kind: "CONDITION", type: "MOCK_PASS" }],
    };
    const notPassRes = await engine.evaluate(notPass, {});
    expect(notPassRes.passed).toBe(false);

    const notFail: RuleNode = {
      kind: "GROUP",
      operator: "NOT",
      children: [{ kind: "CONDITION", type: "MOCK_FAIL" }],
    };
    const notFailRes = await engine.evaluate(notFail, {});
    expect(notFailRes.passed).toBe(true);
  });

  it("should evaluate complex nested rule trees", async () => {
    // Structure: AND( MOCK_PASS, OR( MOCK_FAIL, MOCK_PASS ), NOT( MOCK_FAIL ) )
    const complexRule: RuleNode = {
      kind: "GROUP",
      operator: "AND",
      children: [
        { kind: "CONDITION", type: "MOCK_PASS" },
        {
          kind: "GROUP",
          operator: "OR",
          children: [
            { kind: "CONDITION", type: "MOCK_FAIL" },
            { kind: "CONDITION", type: "MOCK_PASS" },
          ],
        },
        {
          kind: "GROUP",
          operator: "NOT",
          children: [{ kind: "CONDITION", type: "MOCK_FAIL" }],
        },
      ],
    };

    const result = await engine.evaluate(complexRule, {});
    expect(result.passed).toBe(true);
    expect(result.failureReasons.length).toBe(0);
  });
});
