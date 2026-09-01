import { Request } from "express";
import { policyResolver } from "@/core/enablement/policy/policy-resolver";
import { ruleEngine } from "@/core/enablement/engine/rule-engine";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import { SuccessResponse } from "@/utils/responses/success.response";
import { statusCodes } from "@/utils/definitions/constants/common";
import { throwEnablementError } from "../helpers/enablement-error.helper";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import mongoose from "mongoose";

class EvaluateEntityService {
  public async execute(req: Request): Promise<SuccessResponse> {
    const entityType = (req.params.entityType as string) || "";
    const entityId = (req.params.entityId as string) || "";

    if (!mongoose.Types.ObjectId.isValid(entityId)) {
      throwEnablementError(
        "Invalid entity ID format",
        ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
          message: "Invalid entity ID format",
        })
      );
    }

    const upperEntityType = entityType.toUpperCase();

    // Resolve active policy
    const policy = await policyResolver.getActivePolicy(upperEntityType);
    if (!policy) {
      throwEnablementError(
        `No active published enablement policy found for entity type '${upperEntityType}'`,
        ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: `No active published enablement policy found for entity type '${upperEntityType}'`,
        })
      );
    }

    // Load entity based on type
    let entity: any = null;
    if (upperEntityType === "COUNTRY") {
      entity = await CountryModel.findById(entityId);
    } else if (upperEntityType === "REGION") {
      entity = await RegionModel.findById(entityId);
    }

    if (!entity) {
      throwEnablementError(
        `${upperEntityType} entity with ID '${entityId}' not found`,
        ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: `${upperEntityType} entity with ID '${entityId}' not found`,
        })
      );
    }

    // Evaluate rules
    const evaluation = await ruleEngine.evaluate(policy.rules, entity, {
      policyId: policy._id.toString(),
      policyVersion: policy.version,
    });

    return {
      result: {
        code: statusCodes.OK,
        success: true,
        message: evaluation.passed
          ? `${upperEntityType} satisfies all enablement conditions`
          : `${upperEntityType} does not satisfy enablement conditions`,
        data: evaluation,
      },
      DbTransaction: [],
    };
  }
}

export default new EvaluateEntityService();
