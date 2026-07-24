import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findRegionHelperService from "../helpers/validators/find-region.helper.service";
import { populateFields, regionPayload } from "../regions.helper";
import { regionErrorsMessages } from "../regions.messages";
import updateRegionHelperService from "../helpers/operations/update-region.helper.service";
import { IUpdateRegionPayloadStrict } from "../payloads/create-region.payload";
import { regionResponse } from "../regions.response";
import findCountryHelperService from "@/resources/v1/masters/countries/helpers/validators/find-country.helper.service";
import { countryErrorsMessages } from "@/resources/v1/masters/countries/countries.messages";

class updateRegionService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: IUpdateRegionPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findRegionHelperService.execute(
        { _id: id },
        regionErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body = payload ?? (request.body as IUpdateRegionPayloadStrict);

      // Check if country exists if country_id is provided
      if (body.country_id) {
        await findCountryHelperService.execute(
          { _id: new mongoose.Types.ObjectId(body.country_id) } as any,
          countryErrorsMessages,
          {
            throwIfNotFound: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      // Check duplicates for name or code (excluding self)
      if ((body.name && body.name !== existing[0].name) || (body.code && body.code.toUpperCase() !== existing[0].code)) {
        const queryOr: any[] = [];
        if (body.name && body.name !== existing[0].name) queryOr.push({ name: body.name });
        if (body.code && body.code.toUpperCase() !== existing[0].code) queryOr.push({ code: body.code.toUpperCase() });

        await findRegionHelperService.execute(
          {
            $or: queryOr,
            _id: { $ne: id },
          } as any,
          regionErrorsMessages,
          {
            throwIfExists: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      const updated = await updateRegionHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        regionErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return regionPayload(
        "region_updated",
        regionResponse(updated),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, regionErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new updateRegionService();
