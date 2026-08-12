import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findUnitsHelperService from "../helpers/validators/find-units.helper.service";
import { populateFields, unitsPayload } from "../units.helper";
import { unitsErrorsMessages } from "../units.messages";
import updateUnitsHelperService from "../helpers/operations/update-units.helper.service";
import { IInputIUnitsPayloadStrict } from "../payloads/units-payload";
import { unitsResponse } from "../units.response";
import UnitsModel from "@/database/units/units-db-model";

class updateUnitsService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: Partial<IInputIUnitsPayloadStrict>,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findUnitsHelperService.execute(
        { _id: id },
        unitsErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body = payload ?? (request.body as Partial<IInputIUnitsPayloadStrict>);

      const queryOr: any[] = [];
      if (body.title && body.title !== existing[0].title) queryOr.push({ title: body.title });
      if (body.label && body.label !== existing[0].label) queryOr.push({ label: body.label });
      if (body.dimension && body.dimension !== existing[0].dimension) queryOr.push({ dimension: body.dimension });

      if (queryOr.length > 0) {
        const existingDuplicate = await UnitsModel.findOne({
          $or: queryOr,
          _id: { $ne: id },
          is_deleted: { $in: [true, false] },
        }).session(session);

        if (existingDuplicate) {
          if (!existingDuplicate.is_deleted && existingDuplicate.is_active) {
            throw new Error("already_exists");
          }

          existingDuplicate.title = `${existingDuplicate.title}_deleted_${Date.now()}`;
          existingDuplicate.label = `${existingDuplicate.label}_deleted_${Date.now()}`;
          existingDuplicate.dimension = `${existingDuplicate.dimension}_deleted_${Date.now()}`;
          await existingDuplicate.save({ session });
        }
      }

      if (body.is_default === false && existing[0].is_default === true) {
        const otherDefault = await UnitsModel.findOne({
          _id: { $ne: id },
          is_default: true,
          is_deleted: false,
          is_active: true,
        }).session(session);
        if (!otherDefault) {
          body.is_default = true;
        }
      }

      if (body.is_default === true) {
        await UnitsModel.updateMany(
          { _id: { $ne: id }, is_deleted: false, is_active: true },
          { $set: { is_default: false } },
        ).session(session);
      }

      const updated = await updateUnitsHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        unitsErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return unitsPayload(
        "units_updated",
        unitsResponse(updated),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, unitsErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new updateUnitsService();
