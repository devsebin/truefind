import { Request } from "express";
import { conditionRegistry } from "@/core/enablement/registry/condition-registry";
import { SuccessResponse } from "@/utils/responses/success.response";
import { statusCodes } from "@/utils/definitions/constants/common";

class ListConditionsService {
  public async execute(req: Request): Promise<SuccessResponse> {
    const entityType = req.query.entityType as string | undefined;
    const conditions = conditionRegistry.listMetadata(entityType);

    return {
      result: {
        code: statusCodes.OK,
        success: true,
        message: "Enablement conditions retrieved successfully",
        data: conditions,
      },
      DbTransaction: [],
    };
  }
}

export default new ListConditionsService();
