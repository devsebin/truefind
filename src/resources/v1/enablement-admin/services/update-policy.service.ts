import { Request } from "express";
import EnablementPolicyModel from "@/database/enablement-policies/enablement-policies-db-model";
import EnablementPolicyAuditModel from "@/database/enablement-policy-audits/enablement-policy-audits-db-model";
import { PolicyAuditAction, PolicyStatus } from "@/core/enablement/types/policy";
import { policyValidator } from "@/core/enablement/policy/policy-validator";
import { SuccessResponse } from "@/utils/responses/success.response";
import { statusCodes } from "@/utils/definitions/constants/common";
import { throwEnablementError } from "../helpers/enablement-error.helper";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import mongoose from "mongoose";

class UpdatePolicyService {
  public async execute(id: string, req: Request): Promise<SuccessResponse> {
    const { name, description, rules, effective_from, effective_until } = req.body;
    const userId = (req as any).user?._id;

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

    if (policy.status !== PolicyStatus.DRAFT) {
      throwEnablementError(
        `Cannot modify policy with status '${policy.status}'. Published policies are immutable; create a new draft instead.`,
        ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
          message: `Cannot modify policy with status '${policy.status}'. Published policies are immutable; create a new draft instead.`,
        })
      );
    }

    if (rules) {
      const validationResult = policyValidator.validate(rules, policy.entity_type);
      if (!validationResult.valid) {
        throwEnablementError(
          "Policy rules are invalid",
          ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
            message: "Policy rules are invalid",
            data: validationResult.errors,
          })
        );
      }
      policy.rules = rules;
    }

    if (name) policy.name = name;
    if (description !== undefined) policy.description = description;
    if (effective_from !== undefined) policy.effective_from = effective_from ? new Date(effective_from) : null;
    if (effective_until !== undefined) policy.effective_until = effective_until ? new Date(effective_until) : null;
    policy.updated_by = userId;

    const updated = await policy.save();

    await EnablementPolicyAuditModel.create({
      policy_id: policy._id,
      entity_type: policy.entity_type,
      version: policy.version,
      action: PolicyAuditAction.UPDATED,
      performed_by: userId,
      rules_snapshot: policy.rules,
      notes: `Draft policy v${policy.version} updated`,
    });

    return {
      result: {
        code: statusCodes.OK,
        success: true,
        message: "Policy draft updated successfully",
        data: updated,
      },
      DbTransaction: [],
    };
  }
}

export default new UpdatePolicyService();
