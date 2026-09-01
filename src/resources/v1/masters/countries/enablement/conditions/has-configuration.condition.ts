import { ConditionEvaluator, ConditionMetadata } from "@/core/enablement/types/condition";
import { ConditionResult } from "@/core/enablement/types/rule-result";
import ICountry from "@/database/countries/countries-db-interface";

export class HasConfigurationCondition implements ConditionEvaluator<ICountry> {
  public readonly type = "HAS_CONFIGURATION";
  public readonly metadata: ConditionMetadata = {
    type: "HAS_CONFIGURATION",
    label: "Has Valid Configuration",
    description: "Requires the country to have required core configuration fields (currency, phone_code, continent, etc.)",
    applicableEntityTypes: ["COUNTRY"],
    parameters: {
      requireCurrency: {
        type: "boolean",
        label: "Require currency",
        description: "Whether currency code is required",
        required: false,
        default: true,
      },
      requirePhoneCode: {
        type: "boolean",
        label: "Require phone code",
        description: "Whether international phone code is required",
        required: false,
        default: true,
      },
      requireContinent: {
        type: "boolean",
        label: "Require continent",
        description: "Whether continent is required",
        required: false,
        default: true,
      },
    },
  };

  public async evaluate(
    country: ICountry,
    params?: Record<string, unknown>
  ): Promise<ConditionResult> {
    const requireCurrency = params?.requireCurrency !== false;
    const requirePhoneCode = params?.requirePhoneCode !== false;
    const requireContinent = params?.requireContinent !== false;

    const missingFields: string[] = [];

    if (requireCurrency && (!country.currency || country.currency.trim() === "")) {
      missingFields.push("currency");
    }

    if (requirePhoneCode && (!country.phone_code || country.phone_code.trim() === "")) {
      missingFields.push("phone_code");
    }

    if (requireContinent && (!country.continent || country.continent.trim() === "")) {
      missingFields.push("continent");
    }

    const passed = missingFields.length === 0;

    return {
      passed,
      type: this.type,
      code: "HAS_CONFIGURATION",
      message: passed
        ? `Country configuration is valid`
        : `Country is missing required configuration: ${missingFields.join(", ")}`,
      metadata: {
        missingFields,
      },
    };
  }
}

export const hasConfigurationCondition = new HasConfigurationCondition();
