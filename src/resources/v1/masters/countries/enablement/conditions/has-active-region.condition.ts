import { ConditionEvaluator, ConditionMetadata } from "@/core/enablement/types/condition";
import { ConditionResult } from "@/core/enablement/types/rule-result";
import ICountry from "@/database/countries/countries-db-interface";
import RegionModel from "@/database/regions/regions-db-model";

export class HasActiveRegionCondition implements ConditionEvaluator<ICountry> {
  public readonly type = "HAS_ACTIVE_REGION";
  public readonly metadata: ConditionMetadata = {
    type: "HAS_ACTIVE_REGION",
    label: "Has Active Region",
    description: "Requires the country to have at least N active and enabled regions",
    applicableEntityTypes: ["COUNTRY"],
    parameters: {
      minimum: {
        type: "number",
        label: "Minimum active regions",
        description: "Minimum number of active and non-deleted regions required",
        required: false,
        default: 1,
        minimum: 1,
      },
    },
  };

  public async evaluate(
    country: ICountry,
    params?: Record<string, unknown>
  ): Promise<ConditionResult> {
    const minimum = typeof params?.minimum === "number" ? params.minimum : 1;

    let activeCount = 0;

    // Check if region_ids array is populated or contains IDs
    if (country.region_ids && Array.isArray(country.region_ids) && country.region_ids.length > 0) {
      // Query database for active and non-deleted regions matching region_ids
      activeCount = await RegionModel.countDocuments({
        _id: { $in: country.region_ids },
        is_active: true,
        is_deleted: false,
      });
    }

    const passed = activeCount >= minimum;

    return {
      passed,
      type: this.type,
      code: "HAS_ACTIVE_REGION",
      message: passed
        ? `Country has ${activeCount} active region(s), meeting minimum requirement of ${minimum}`
        : `Country requires at least ${minimum} active region(s), but only ${activeCount} found`,
      metadata: {
        actual: activeCount,
        required: minimum,
      },
    };
  }
}

export const hasActiveRegionCondition = new HasActiveRegionCondition();
