import { Request } from "express";
import EnablementPolicyModel from "@/database/enablement-policies/enablement-policies-db-model";
import { SuccessResponse } from "@/utils/responses/success.response";
import { statusCodes } from "@/utils/definitions/constants/common";
import { throwEnablementError } from "../helpers/enablement-error.helper";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";

class GetPolicyService {
  public async getByEntityType(req: Request): Promise<SuccessResponse> {
    const entityTypeParam = req.params.entityType as string;
    const entityType = entityTypeParam.toUpperCase();
    const versionStr = req.params.version as string | undefined;

    const filter: any = { entity_type: entityType };
    if (versionStr) {
      const version = parseInt(versionStr, 10);
      if (isNaN(version)) {
        throwEnablementError(
          "Version must be an integer",
          ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
            message: "Version must be an integer",
          })
        );
      }
      filter.version = version;
    }

    const policies = await EnablementPolicyModel.find(filter).sort({ version: -1 });

    return {
      result: {
        code: statusCodes.OK,
        success: true,
        message: "Policies retrieved successfully",
        data: policies,
      },
      DbTransaction: [],
    };
  }

  public async getById(id: string): Promise<SuccessResponse> {
    const policy = await EnablementPolicyModel.findById(id);
    if (!policy) {
      throwEnablementError(
        "Enablement policy not found",
        ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "Enablement policy not found",
        })
      );
    }

    return {
      result: {
        code: statusCodes.OK,
        success: true,
        message: "Policy retrieved successfully",
        data: policy,
      },
      DbTransaction: [],
    };
  }
}

export default new GetPolicyService();
