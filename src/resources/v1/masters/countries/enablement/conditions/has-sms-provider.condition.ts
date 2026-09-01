import { ConditionEvaluator, ConditionMetadata } from "@/core/enablement/types/condition";
import { ConditionResult } from "@/core/enablement/types/rule-result";
import ICountry from "@/database/countries/countries-db-interface";
import ProviderModel from "@/database/providers/providers-db-model";

export class HasSmsProviderCondition implements ConditionEvaluator<ICountry> {
  public readonly type = "HAS_SMS_PROVIDER";
  public readonly metadata: ConditionMetadata = {
    type: "HAS_SMS_PROVIDER",
    label: "Has SMS Provider",
    description: "Requires the country to have at least N configured/tested SMS providers",
    applicableEntityTypes: ["COUNTRY"],
    parameters: {
      minimum: {
        type: "number",
        label: "Minimum providers",
        description: "Minimum number of valid providers required",
        required: false,
        default: 1,
        minimum: 1,
      },
      requireTested: {
        type: "boolean",
        label: "Require tested provider",
        description: "Whether the provider must be marked as tested",
        required: false,
        default: false,
      },
    },
  };

  public async evaluate(
    country: ICountry,
    params?: Record<string, unknown>
  ): Promise<ConditionResult> {
    const minimum = typeof params?.minimum === "number" ? params.minimum : 1;
    const requireTested = Boolean(params?.requireTested);

    const providers = country.providers || [];
    let validProviders = providers;

    if (requireTested) {
      validProviders = providers.filter((p) => p.is_tested);
    }

    let validCount = validProviders.length;

    // Also verify that provider_ids exist and are active if providers list has items
    if (validCount > 0) {
      const providerIds = validProviders.map((p) => p.provider_id);
      const activeDbProvidersCount = await ProviderModel.countDocuments({
        _id: { $in: providerIds },
        is_active: true,
        is_deleted: false,
      });
      validCount = activeDbProvidersCount;
    }

    const passed = validCount >= minimum;

    return {
      passed,
      type: this.type,
      code: "HAS_SMS_PROVIDER",
      message: passed
        ? `Country has ${validCount} SMS provider(s), meeting requirement of ${minimum}`
        : `Country requires at least ${minimum} SMS provider(s), but only ${validCount} valid provider(s) found`,
      metadata: {
        actual: validCount,
        required: minimum,
        requireTested,
      },
    };
  }
}

export const hasSmsProviderCondition = new HasSmsProviderCondition();
