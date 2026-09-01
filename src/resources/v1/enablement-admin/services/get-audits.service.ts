import { Request } from "express";
import EnablementPolicyAuditModel from "@/database/enablement-policy-audits/enablement-policy-audits-db-model";
import { SuccessResponse } from "@/utils/responses/success.response";
import { statusCodes } from "@/utils/definitions/constants/common";
import mongoose from "mongoose";

class GetAuditsService {
  public async execute(req: Request): Promise<SuccessResponse> {
    const { policyId, entityType } = req.query;

    const filter: any = {};
    if (policyId && mongoose.Types.ObjectId.isValid(policyId as string)) {
      filter.policy_id = new mongoose.Types.ObjectId(policyId as string);
    }
    if (entityType) {
      filter.entity_type = (entityType as string).toUpperCase();
    }

    const audits = await EnablementPolicyAuditModel.find(filter)
      .sort({ created_at: -1 })
      .populate("performed_by", "name email");

    return {
      result: {
        code: statusCodes.OK,
        success: true,
        message: "Policy audit logs retrieved successfully",
        data: audits,
      },
      DbTransaction: [],
    };
  }
}

export default new GetAuditsService();
