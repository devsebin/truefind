import { Request } from "express";
import EnablementPolicyModel from "@/database/enablement-policies/enablement-policies-db-model";
import { policyValidator } from "@/core/enablement/policy/policy-validator";
import { SuccessResponse } from "@/utils/responses/success.response";
import { statusCodes } from "@/utils/definitions/constants/common";
import { throwEnablementError } from "../helpers/enablement-error.helper";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import mongoose from "mongoose";

class ValidatePolicyService {
  public async execute(id: string, req: Request): Promise<SuccessResponse> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throwEnablementError(
        "Invalid policy ID format",
        ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
          message: "Invalid policy ID format",
        })
      );
    }

    const policy = await EnablementPolicyModel.findById(id);
    if (!policy) {
      throwEnablementError(
        "Enablement policy not found",
        ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Enablement policy not found",
        })
      );
    }

    // Rules can be passed in request body to test changes without saving, or default to saved policy rules
    const rulesToValidate = req.body?.rules || policy.rules;
    const validationResult = policyValidator.validate(rulesToValidate, policy.entity_type);

    return {
      result: {
        code: statusCodes.OK,
        success: true,
        message: validationResult.valid ? "Policy rules are valid" : "Policy rules contain validation errors",
        data: validationResult,
      },
      DbTransaction: [],
    };
  }
}

export default new ValidatePolicyService();
