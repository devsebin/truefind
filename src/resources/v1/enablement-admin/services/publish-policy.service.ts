import { Request } from "express";
import EnablementPolicyModel from "@/database/enablement-policies/enablement-policies-db-model";
import EnablementPolicyAuditModel from "@/database/enablement-policy-audits/enablement-policy-audits-db-model";
import { PolicyAuditAction, PolicyStatus } from "@/core/enablement/types/policy";
import { policyValidator } from "@/core/enablement/policy/policy-validator";
import { policyResolver } from "@/core/enablement/policy/policy-resolver";
import { SuccessResponse } from "@/utils/responses/success.response";
import { statusCodes } from "@/utils/definitions/constants/common";
import { throwEnablementError } from "../helpers/enablement-error.helper";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import mongoose from "mongoose";

class PublishPolicyService {
  public async execute(id: string, req: Request): Promise<SuccessResponse> {
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

    if (policy.status === PolicyStatus.PUBLISHED) {
      throwEnablementError(
        "Policy is already published",
        ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "Policy is already published",
        })
      );
    }

    // Full rule validation before publishing
    const validationResult = policyValidator.validate(policy.rules, policy.entity_type);
    if (!validationResult.valid) {
      throwEnablementError(
        "Cannot publish policy with invalid rule configuration",
        ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
          message: "Cannot publish policy with invalid rule configuration",
          data: validationResult.errors,
        })
      );
    }

    // Archive previously published policy of the same entity type
    const previousPublished = await EnablementPolicyModel.findOne({
      entity_type: policy.entity_type,
      status: PolicyStatus.PUBLISHED,
      _id: { $ne: policy._id },
    });

    if (previousPublished) {
      previousPublished.status = PolicyStatus.ARCHIVED;
      previousPublished.updated_by = userId;
      await previousPublished.save();

      await EnablementPolicyAuditModel.create({
        policy_id: previousPublished._id,
        entity_type: previousPublished.entity_type,
        version: previousPublished.version,
        action: PolicyAuditAction.ARCHIVED,
        performed_by: userId,
        notes: `Archived by publication of v${policy.version}`,
      });
    }

    // Publish the new policy
    policy.status = PolicyStatus.PUBLISHED;
    policy.updated_by = userId;
    const publishedPolicy = await policy.save();

    // Log publication audit
    await EnablementPolicyAuditModel.create({
      policy_id: publishedPolicy._id,
      entity_type: publishedPolicy.entity_type,
      version: publishedPolicy.version,
      action: PolicyAuditAction.PUBLISHED,
      performed_by: userId,
      previous_version: previousPublished ? previousPublished.version : undefined,
      new_version: publishedPolicy.version,
      rules_snapshot: publishedPolicy.rules,
      notes: `Published policy v${publishedPolicy.version}`,
    });

    // Invalidate resolver cache for this entity type
    policyResolver.invalidate(publishedPolicy.entity_type);

    return {
      result: {
        code: statusCodes.OK,
        success: true,
        message: `Policy v${publishedPolicy.version} for ${publishedPolicy.entity_type} published successfully`,
        data: publishedPolicy,
      },
      DbTransaction: [],
    };
  }
}

export default new PublishPolicyService();
