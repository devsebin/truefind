import { SingleResponse } from "@/utils/responses/success.response";
import { IInputIUnitsPayloadStrict } from "../payloads/units-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toUnitsDTO } from "../dto/create-units.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { unitsErrorsMessages } from "../units.messages";
import findUnitsHelperService from "../helpers/validators/find-units.helper.service";
import { populateFields, unitsPayload } from "../units.helper";
import createUnitsHelperService from "../helpers/operations/create-units.helper.service";
import { unitsResponse } from "../units.response";
import UnitsModel from "@/database/units/units-db-model";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class createUnitsService {
  public async execute(
    request: Request,
    payload?: IInputIUnitsPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toUnitsDTO);

    try {
      session.startTransaction();

      const existingDuplicate = await UnitsModel.findOne({
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
        existingDuplicate.dimension = body.dimension;
        existingDuplicate.color = body.color;

        const defaultUnitExists = await UnitsModel.findOne({
          is_default: true,
          is_deleted: false,
          is_active: true,
          _id: { $ne: existingDuplicate._id },
        }).session(session);

        if (!defaultUnitExists) {
          existingDuplicate.is_default = true;
        } else if (body.is_default) {
          existingDuplicate.is_default = true;
        }

        if (existingDuplicate.is_default) {
          await UnitsModel.updateMany(
            { _id: { $ne: existingDuplicate._id }, is_deleted: false, is_active: true },
            { $set: { is_default: false } },
          ).session(session);
        }

        existingDuplicate.is_deleted = false;
        existingDuplicate.is_active = true;

        const saved = await existingDuplicate.save({ session });
        await saved.populate(populateFields);

        DbTransactions.push(
          await createDbTransaction(
            tableName.Units,
            apiMethods.POST,
            operationTypes.Create,
            saved.toObject(),
          ),
        );

        await session.commitTransaction();
        return unitsPayload(
          "units_created",
          unitsResponse(saved),
          DbTransactions,
        );
      }

      const defaultUnitExists = await UnitsModel.findOne({
        is_default: true,
        is_deleted: false,
        is_active: true,
      }).session(session);

      if (!defaultUnitExists) {
        body.is_default = true;
      }

      if (body.is_default) {
        await UnitsModel.updateMany(
          { is_deleted: false, is_active: true },
          { $set: { is_default: false } },
        ).session(session);
      }

      const newUnit = await createUnitsHelperService.execute(
        body,
        session,
        DbTransactions,
        unitsErrorsMessages,
      );

      await newUnit.populate(populateFields);

      await session.commitTransaction();
      return unitsPayload(
        "units_created",
        unitsResponse(newUnit),
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

export default new createUnitsService();
