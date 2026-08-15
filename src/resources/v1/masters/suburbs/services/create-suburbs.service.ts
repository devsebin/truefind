import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import { Request } from "express";
import mongoose from "mongoose";
import findSuburbHelperService from "../helpers/validators/find-suburb.helper.service";
import { IInputSuburbPayloadStrict } from "../payloads/create-suburb.payload";
import { populateFields, suburbPayload, throwError } from "../suburbs.helper";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { suburbErrorsMessages } from "../suburbs.messages";
import { toSuburbDTO } from "../dto/suburb.dto";
import createSuburbHelperService from "../helpers/operations/create-suburb.helper.service";
import { suburbResponse } from "../suburbs.response";
import findCountryHelperService from "@/resources/v1/masters/countries/helpers/validators/find-country.helper.service";
import { countryErrorsMessages } from "@/resources/v1/masters/countries/countries.messages";
import findRegionHelperService from "@/resources/v1/masters/regions/helpers/validators/find-region.helper.service";
import { regionErrorsMessages } from "@/resources/v1/masters/regions/regions.messages";
import findDistrictHelperService from "@/resources/v1/masters/districts/helpers/validators/find-district.helper.service";
import { districtErrorsMessages } from "@/resources/v1/masters/districts/districts.messages";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class createSuburbsService {
  public async execute(
    request: Request,
    payload?: IInputSuburbPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toSuburbDTO);

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
      const regions = await findRegionHelperService.execute(
        { _id: body.region_id } as any,
        regionErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: true,
          session,
        },
      );

      // Validate region belongs to the country
      const region = regions[0];
      if (region.country_id.toString() !== body.country_id.toString()) {
        const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
          message: "Region does not belong to the selected country",
          data: { region_id: body.region_id, country_id: body.country_id },
        });
        throwError("region_not_belonging", response);
      }

      // Check if district exists
      const districts = await findDistrictHelperService.execute(
        { _id: body.district_id } as any,
        districtErrorsMessages,
        {
          throwIfNotFound: true,
          lean: true,
          returnDocument: true,
          session,
        },
      );

      // Validate district belongs to the region
      const district = districts[0];
      if (district.region_id.toString() !== body.region_id.toString()) {
        const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
          message: "District does not belong to the selected region",
          data: { district_id: body.district_id, region_id: body.region_id },
        });
        throwError("district_not_belonging", response);
      }

      // Check duplicate suburb name/code (scoped to district_id)
      await findSuburbHelperService.execute(
        {
          district_id: body.district_id,
          $or: [
            { name: { $regex: new RegExp(`^${body.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
            { code: body.code },
          ],
        } as any,
        suburbErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      const newSuburb = await createSuburbHelperService.execute(
        body,
        session,
        DbTransactions,
        suburbErrorsMessages,
      );

      await newSuburb.populate(populateFields);

      await session.commitTransaction();

      return suburbPayload(
        "suburb_created",
        suburbResponse(newSuburb),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, suburbErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new createSuburbsService();
