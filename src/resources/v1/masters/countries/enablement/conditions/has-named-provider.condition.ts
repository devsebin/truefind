import { ConditionEvaluator, ConditionMetadata } from "@/core/enablement/types/condition";
import { ConditionResult } from "@/core/enablement/types/rule-result";
import ICountry from "@/database/countries/countries-db-interface";
import ProviderModel from "@/database/providers/providers-db-model";

export class HasNamedProviderCondition implements ConditionEvaluator<ICountry> {
  constructor(
    public readonly type: string,
    private readonly providerNamePattern: string,
    label: string
  ) {
    this.metadata = {
      type,
      label,
      description: `Requires the country to have at least one active '${providerNamePattern}' SMS provider configured`,
      applicableEntityTypes: ["COUNTRY"],
      parameters: {},
    };
  }

  public readonly metadata: ConditionMetadata;

  public async evaluate(country: ICountry): Promise<ConditionResult> {
    const countryProviders = country.providers || [];
    if (countryProviders.length === 0) {
      return {
        passed: false,
        type: this.type,
        code: this.type,
        message: `Country has no provider matching '${this.providerNamePattern}'`,
        metadata: { providerName: this.providerNamePattern, found: false },
      };
    }

    const providerIds = countryProviders.map((p) => p.provider_id);
    const count = await ProviderModel.countDocuments({
      _id: { $in: providerIds },
      name: { $regex: new RegExp(this.providerNamePattern, "i") },
      is_active: true,
      is_deleted: false,
    });

    const passed = count > 0;
    return {
      passed,
      type: this.type,
      code: this.type,
      message: passed
        ? `Found ${count} active '${this.providerNamePattern}' provider(s)`
        : `No active provider matching '${this.providerNamePattern}' found`,
      metadata: {
        providerName: this.providerNamePattern,
        found: count > 0,
        actual: count,
      },
    };
  }
}

export const hasTwilioProviderCondition = new HasNamedProviderCondition(
  "HAS_TWILIO_PROVIDER",
  "Twilio",
  "Has Twilio Provider"
);

export const hasVonageProviderCondition = new HasNamedProviderCondition(
  "HAS_VONAGE_PROVIDER",
  "Vonage",
  "Has Vonage Provider"
);
