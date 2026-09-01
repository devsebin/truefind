import { ConditionEvaluator, ConditionMetadata } from "../types/condition";

export class ConditionRegistry {
  private static instance: ConditionRegistry;
  private evaluators: Map<string, ConditionEvaluator> = new Map();

  private constructor() {}

  public static getInstance(): ConditionRegistry {
    if (!ConditionRegistry.instance) {
      ConditionRegistry.instance = new ConditionRegistry();
    }
    return ConditionRegistry.instance;
  }

  public register(evaluator: ConditionEvaluator): void {
    if (!evaluator.type) {
      throw new Error("Cannot register condition evaluator without a type identifier");
    }
    this.evaluators.set(evaluator.type, evaluator);
  }

  public get(type: string): ConditionEvaluator | undefined {
    return this.evaluators.get(type);
  }

  public has(type: string): boolean {
    return this.evaluators.has(type);
  }

  public getMetadata(type: string): ConditionMetadata | undefined {
    return this.evaluators.get(type)?.metadata;
  }

  public listMetadata(entityType?: string): ConditionMetadata[] {
    const list: ConditionMetadata[] = [];
    for (const evaluator of this.evaluators.values()) {
      if (
        !entityType ||
        evaluator.metadata.applicableEntityTypes.includes("*") ||
        evaluator.metadata.applicableEntityTypes.includes(entityType.toUpperCase())
      ) {
        list.push(evaluator.metadata);
      }
    }
    return list;
  }

  public clear(): void {
    this.evaluators.clear();
  }
}

export const conditionRegistry = ConditionRegistry.getInstance();
