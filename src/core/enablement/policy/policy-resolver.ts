import EnablementPolicyModel, {
  IEnablementPolicyDocument,
} from "@/database/enablement-policies/enablement-policies-db-model";
import { PolicyStatus } from "../types/policy";

export class PolicyResolver {
  private cache: Map<string, { policy: IEnablementPolicyDocument; cachedAt: number }> =
    new Map();
  private ttlMs: number = 60 * 1000; // 1 minute in-memory cache

  public async getActivePolicy(
    entityType: string,
    atDate: Date = new Date()
  ): Promise<IEnablementPolicyDocument | null> {
    const formattedType = entityType.toUpperCase();
    const cacheKey = `${formattedType}`;

    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.cachedAt < this.ttlMs) {
      const p = cached.policy;
      const isEffective =
        (!p.effective_from || new Date(p.effective_from) <= atDate) &&
        (!p.effective_until || new Date(p.effective_until) >= atDate);
      if (isEffective) {
        return p;
      }
    }

    const policy = await EnablementPolicyModel.findOne({
      entity_type: formattedType,
      status: PolicyStatus.PUBLISHED,
      $and: [
        {
          $or: [
            { effective_from: { $exists: false } },
            { effective_from: null },
            { effective_from: { $lte: atDate } },
          ],
        },
        {
          $or: [
            { effective_until: { $exists: false } },
            { effective_until: null },
            { effective_until: { $gte: atDate } },
          ],
        },
      ],
    }).sort({ version: -1 });

    if (policy) {
      this.cache.set(cacheKey, { policy, cachedAt: now });
    } else {
      this.cache.delete(cacheKey);
    }

    return policy;
  }

  public invalidate(entityType?: string): void {
    if (entityType) {
      this.cache.delete(entityType.toUpperCase());
    } else {
      this.cache.clear();
    }
  }
}

export const policyResolver = new PolicyResolver();
