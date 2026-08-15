import { SingleResponse } from "@/utils/responses/success.response";
import { IInputIRolesPayloadStrict } from "../payloads/roles-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toRolesDTO } from "../dto/create-roles.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { rolesErrorsMessages } from "../roles.messages";
import findRolesHelperService from "../helpers/validators/find-roles.helper.service";
import { populateFields, rolesPayload } from "../roles.helper";
import createRolesHelperService from "../helpers/operations/create-roles.helper.service";
import { rolesResponse } from "../roles.response";
import RolesModel from "@/database/roles/roles-db-model";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class createRolesService {
  public async execute(
    request: Request,
    payload?: IInputIRolesPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toRolesDTO);

    try {
      session.startTransaction();

      const existingDuplicate = await RolesModel.findOne({
        $or: [
          { title: body.title },
          { label: body.label },
        ],
        is_deleted: { $in: [true, false] },
      }).session(session);

      if (existingDuplicate) {
        if (!existingDuplicate.is_deleted && existingDuplicate.is_active) {
          throw new Error("already_exists");
        }

        existingDuplicate.title = body.title;
        existingDuplicate.label = body.label;
        existingDuplicate.color = body.color;
        existingDuplicate.is_deleted = false;
        existingDuplicate.is_active = true;

        const saved = await existingDuplicate.save({ session });
        await saved.populate(populateFields);

        DbTransactions.push(
          await createDbTransaction(
            tableName.Roles,
            apiMethods.POST,
            operationTypes.Create,
            saved.toObject(),
          ),
        );

        await session.commitTransaction();
        return rolesPayload(
          "roles_created",
          rolesResponse(saved),
          DbTransactions,
        );
      }

      const defaultRoleExists = await RolesModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
      }).session(session);

      const newRole = await createRolesHelperService.execute(
        body,
        session,
        DbTransactions,
        rolesErrorsMessages,
      );

      await newRole.populate(populateFields);

      await session.commitTransaction();
      return rolesPayload(
        "roles_created",
        rolesResponse(newRole),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, rolesErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new createRolesService();
