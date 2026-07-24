import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { Request } from "express";
import mongoose from "mongoose";
import findDistrictHelperService from "../helpers/validators/find-district.helper.service";
import { IInputDistrictPayloadStrict } from "../payloads/create-district.payload";
import { populateFields, districtPayload } from "../districts.helper";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { districtErrorsMessages } from "../districts.messages";
import { toDistrictDTO } from "../dto/district.dto";
import createDistrictHelperService from "../helpers/operations/create-district.helper.service";
import { districtResponse } from "../districts.response";
import findCountryHelperService from "@/resources/v1/masters/countries/helpers/validators/find-country.helper.service";
import { countryErrorsMessages } from "@/resources/v1/masters/countries/countries.messages";
import findRegionHelperService from "@/resources/v1/masters/regions/helpers/validators/find-region.helper.service";
import { regionErrorsMessages } from "@/resources/v1/masters/regions/regions.messages";

class createDistrictsService {
  public async execute(
    request: Request,
    payload?: IInputDistrictPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toDistrictDTO);

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

      // Check if region exists
      await findRegionHelperService.execute(
        { _id: body.region_id, country_id: body.country_id } as any,
        regionErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      // Check duplicate district name or code
      await findDistrictHelperService.execute(
        {
          $or: [
            { name: body.name },
            { code: body.code },
          ],
        } as any,
        districtErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      const newDistrict = await createDistrictHelperService.execute(
        body,
        session,
        DbTransactions,
        districtErrorsMessages,
      );

      await newDistrict.populate(populateFields);

      await session.commitTransaction();

      return districtPayload(
        "district_created",
        districtResponse(newDistrict),
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

export default new createDistrictsService();
