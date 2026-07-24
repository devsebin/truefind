import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { Request } from "express";
import mongoose from "mongoose";
import findRegionHelperService from "../helpers/validators/find-region.helper.service";
import { IInputRegionPayloadStrict } from "../payloads/create-region.payload";
import { populateFields, regionPayload } from "../regions.helper";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { regionErrorsMessages } from "../regions.messages";
import { toRegionDTO } from "../dto/region.dto";
import createRegionHelperService from "../helpers/operations/create-region.helper.service";
import { regionResponse } from "../regions.response";
import findCountryHelperService from "@/resources/v1/masters/countries/helpers/validators/find-country.helper.service";
import { countryErrorsMessages } from "@/resources/v1/masters/countries/countries.messages";

class createRegionService {
  public async execute(
    request: Request,
    payload?: IInputRegionPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toRegionDTO);

    try {
      session.startTransaction();

      // Check if country exists
      await findCountryHelperService.execute(
        { _id: body.country_id } as any,
        countryErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      // Check duplicate region name or code
      await findRegionHelperService.execute(
        {
          $or: [
            { name: body.name },
            { code: body.code },
          ],
        } as any,
        regionErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      const newRegion = await createRegionHelperService.execute(
        body,
        session,
        DbTransactions,
        regionErrorsMessages,
      );

      await newRegion.populate(populateFields);

      await session.commitTransaction();

      return regionPayload(
        "region_created",
        regionResponse(newRegion),
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

export default new createRegionService();
