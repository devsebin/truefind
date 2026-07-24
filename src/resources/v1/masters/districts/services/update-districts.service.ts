import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findDistrictHelperService from "../helpers/validators/find-district.helper.service";
import { populateFields, districtPayload } from "../districts.helper";
import { districtErrorsMessages } from "../districts.messages";
import updateDistrictHelperService from "../helpers/operations/update-district.helper.service";
import { IUpdateDistrictPayloadStrict } from "../payloads/create-district.payload";
import { districtResponse } from "../districts.response";
import findCountryHelperService from "@/resources/v1/masters/countries/helpers/validators/find-country.helper.service";
import { countryErrorsMessages } from "@/resources/v1/masters/countries/countries.messages";
import findRegionHelperService from "@/resources/v1/masters/regions/helpers/validators/find-region.helper.service";
import { regionErrorsMessages } from "@/resources/v1/masters/regions/regions.messages";

class updateDistrictsService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: IUpdateDistrictPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findDistrictHelperService.execute(
        { _id: id },
        districtErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body = payload ?? (request.body as IUpdateDistrictPayloadStrict);

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

      // Check if region exists if region_id is provided
      if (body.region_id) {
        await findRegionHelperService.execute(
          { _id: new mongoose.Types.ObjectId(body.region_id) } as any,
          regionErrorsMessages,
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

        await findDistrictHelperService.execute(
          {
            $or: queryOr,
            _id: { $ne: id },
          } as any,
          districtErrorsMessages,
          {
            throwIfExists: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      const updated = await updateDistrictHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        districtErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return districtPayload(
        "district_updated",
        districtResponse(updated),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, districtErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new updateDistrictsService();
