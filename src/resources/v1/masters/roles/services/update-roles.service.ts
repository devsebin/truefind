import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findRolesHelperService from "../helpers/validators/find-roles.helper.service";
import { populateFields, rolesPayload, throwError } from "../roles.helper";
import { rolesErrorsMessages } from "../roles.messages";
import updateRolesHelperService from "../helpers/operations/update-roles.helper.service";
import { IInputIRolesPayloadStrict } from "../payloads/roles-payload";
import { rolesResponse } from "../roles.response";
import RolesModel from "@/database/roles/roles-db-model";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class updateRolesService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: Partial<IInputIRolesPayloadStrict>,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findRolesHelperService.execute(
        { _id: id },
        rolesErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body = payload ?? (request.body as Partial<IInputIRolesPayloadStrict>);

      const queryOr: any[] = [];
      if (body.title && body.title !== existing[0].title) queryOr.push({ title: { $regex: new RegExp(`^${body.title}$`, "i") } });
      if (body.label && body.label !== existing[0].label) queryOr.push({ label: body.label });

      if (queryOr.length > 0) {
        const existingDuplicate = await RolesModel.findOne({
          $or: queryOr,
          _id: { $ne: id },
          is_deleted: { $in: [true, false] },
        }).session(session);

        if (existingDuplicate) {
          if (!existingDuplicate.is_deleted && existingDuplicate.is_active) {
            const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
              message: "role already exists",
              data: body,
              filler: { 0: existingDuplicate.title },
            });
            throwError("already_exists", response);
          }

          existingDuplicate.title = `${existingDuplicate.title}_deleted_${Date.now()}`;
          existingDuplicate.label = `${existingDuplicate.label}_deleted_${Date.now()}`;
          await existingDuplicate.save({ session });
        }
      }


      const updated = await updateRolesHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        rolesErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return rolesPayload(
        "roles_updated",
        rolesResponse(updated),
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

export default new updateRolesService();
