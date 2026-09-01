import { Request } from "express";
import EnablementPolicyModel from "@/database/enablement-policies/enablement-policies-db-model";
import EnablementPolicyAuditModel from "@/database/enablement-policy-audits/enablement-policy-audits-db-model";
import { PolicyAuditAction, PolicyStatus } from "@/core/enablement/types/policy";
import { policyResolver } from "@/core/enablement/policy/policy-resolver";
import { SuccessResponse } from "@/utils/responses/success.response";
import { statusCodes } from "@/utils/definitions/constants/common";
import { throwEnablementError } from "../helpers/enablement-error.helper";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";
import mongoose from "mongoose";

class RollbackPolicyService {
  public async execute(targetPolicyId: string, req: Request): Promise<SuccessResponse> {
    const userId = (req as any).user?._id;

    if (!mongoose.Types.ObjectId.isValid(targetPolicyId)) {
      throwEnablementError(
        "Invalid target policy ID format",
        ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
          message: "Invalid target policy ID format",
        })
      );
    }

    const targetPolicy = await EnablementPolicyModel.findById(targetPolicyId);
    if (!targetPolicy) {
      throwEnablementError(
        "Target enablement policy not found to rollback to",
        ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Target enablement policy not found to rollback to",
        })
      );
    }

    const entityType = targetPolicy.entity_type;

    // Find currently published policy
    const currentPublished = await EnablementPolicyModel.findOne({
      entity_type: entityType,
      status: PolicyStatus.PUBLISHED,
    });

    if (currentPublished && currentPublished._id.toString() === targetPolicy._id.toString()) {
      throwEnablementError(
        "Target policy version is already the active published policy",
        ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "Target policy version is already the active published policy",
        })
      );
    }

    // Determine next version (never mutate historical target version)
    const latest = await EnablementPolicyModel.findOne({ entity_type: entityType }).sort({ version: -1 });
    const nextVersion = latest ? latest.version + 1 : 1;

    // Archive currently active policy if exists
    if (currentPublished) {
      currentPublished.status = PolicyStatus.ARCHIVED;
      currentPublished.updated_by = userId;
      await currentPublished.save();

      await EnablementPolicyAuditModel.create({
        policy_id: currentPublished._id,
        entity_type: currentPublished.entity_type,
        version: currentPublished.version,
        action: PolicyAuditAction.ARCHIVED,
        performed_by: userId,
        notes: `Archived during rollback to v${targetPolicy.version}`,
      });
    }

    // Create new published policy copying target policy's rules
    const rolledBackPolicy = new EnablementPolicyModel({
      entity_type: targetPolicy.entity_type,
      name: `${targetPolicy.name} (Rollback to v${targetPolicy.version})`,
      description: `Rolled back from v${currentPublished?.version || "unknown"} to rules of v${targetPolicy.version}`,
      version: nextVersion,
      status: PolicyStatus.PUBLISHED,
      rules: targetPolicy.rules,
      effective_from: new Date(),
      effective_until: null,
      created_by: userId,
      updated_by: userId,
    });

    const saved = await rolledBackPolicy.save();

    await EnablementPolicyAuditModel.create({
      policy_id: saved._id,
      entity_type: saved.entity_type,
      version: saved.version,
      action: PolicyAuditAction.ROLLED_BACK,
      performed_by: userId,
      previous_version: currentPublished ? currentPublished.version : undefined,
      new_version: saved.version,
      rules_snapshot: saved.rules,
      notes: `Rolled back to configuration from historical version ${targetPolicy.version} as new v${saved.version}`,
    });

    policyResolver.invalidate(entityType);

    return {
      result: {
        code: statusCodes.OK,
        success: true,
        message: `Successfully rolled back to configuration of v${targetPolicy.version} as newly published v${saved.version}`,
        data: saved,
      },
      DbTransaction: [],
    };
  }
}

export default new RollbackPolicyService();
