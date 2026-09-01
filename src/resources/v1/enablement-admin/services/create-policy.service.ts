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

class CreatePolicyService {
  public async execute(req: Request): Promise<SuccessResponse> {
    const { entity_type, name, description, rules, effective_from, effective_until } = req.body;
    const userId = (req as any).user?._id;

    if (!entity_type || !name || !rules) {
      throwEnablementError(
        "entity_type, name, and rules are required fields",
        ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
          message: "entity_type, name, and rules are required fields",
        })
      );
    }

    const upperEntityType = entity_type.toUpperCase();

    // Validate rules structure and parameters
    const validationResult = policyValidator.validate(rules, upperEntityType);
    if (!validationResult.valid) {
      throwEnablementError(
        "Policy rules are invalid",
        ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
          message: "Policy rules are invalid",
          data: validationResult.errors,
        })
      );
    }

    // Determine next version for this entity type
    const latestPolicy = await EnablementPolicyModel.findOne({ entity_type: upperEntityType }).sort({
      version: -1,
    });
    const nextVersion = latestPolicy ? latestPolicy.version + 1 : 1;

    const policy = new EnablementPolicyModel({
      entity_type: upperEntityType,
      name,
      description,
      version: nextVersion,
      status: PolicyStatus.DRAFT,
      rules,
      effective_from: effective_from ? new Date(effective_from) : null,
      effective_until: effective_until ? new Date(effective_until) : null,
      created_by: userId,
      updated_by: userId,
    });

    const savedPolicy = await policy.save();

    // Audit log
    await EnablementPolicyAuditModel.create({
      policy_id: savedPolicy._id,
      entity_type: upperEntityType,
      version: nextVersion,
      action: PolicyAuditAction.CREATED,
      performed_by: userId,
      rules_snapshot: rules,
      notes: `Draft policy v${nextVersion} created`,
    });

    return {
      result: {
        code: statusCodes.Created,
        success: true,
        message: "Draft policy created successfully",
        data: savedPolicy,
      },
      DbTransaction: [],
    };
  }
}

export default new CreatePolicyService();
