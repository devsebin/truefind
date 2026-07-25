import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findSuburbHelperService from "../helpers/validators/find-suburb.helper.service";
import { populateFields, suburbPayload, throwError } from "../suburbs.helper";
import { suburbErrorsMessages } from "../suburbs.messages";
import updateSuburbHelperService from "../helpers/operations/update-suburb.helper.service";
import { IUpdateSuburbPayloadStrict } from "../payloads/create-suburb.payload";
import { suburbResponse } from "../suburbs.response";
import findCountryHelperService from "@/resources/v1/masters/countries/helpers/validators/find-country.helper.service";
import { countryErrorsMessages } from "@/resources/v1/masters/countries/countries.messages";
import findRegionHelperService from "@/resources/v1/masters/regions/helpers/validators/find-region.helper.service";
import { regionErrorsMessages } from "@/resources/v1/masters/regions/regions.messages";
import findDistrictHelperService from "@/resources/v1/masters/districts/helpers/validators/find-district.helper.service";
import { districtErrorsMessages } from "@/resources/v1/masters/districts/districts.messages";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";

class updateSuburbsService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: IUpdateSuburbPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findSuburbHelperService.execute(
        { _id: id },
        suburbErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body = payload ?? (request.body as IUpdateSuburbPayloadStrict);

      const targetCountryId = body.country_id ? new mongoose.Types.ObjectId(body.country_id) : existing[0].country_id;
      const targetRegionId = body.region_id ? new mongoose.Types.ObjectId(body.region_id) : existing[0].region_id;
      const targetDistrictId = body.district_id ? new mongoose.Types.ObjectId(body.district_id) : existing[0].district_id;

      // Check if country exists if country_id is updated
      if (body.country_id) {
        await findCountryHelperService.execute(
          { _id: targetCountryId } as any,
          countryErrorsMessages,
          { throwIfNotFound: true, lean: true, returnDocument: false, session },
        );
      }

      // Check if region exists and check relation if country_id or region_id is updated
      if (body.region_id || body.country_id) {
        const regions = await findRegionHelperService.execute(
          { _id: targetRegionId } as any,
          regionErrorsMessages,
          { throwIfNotFound: true, lean: true, returnDocument: true, session },
        );
        const region = regions[0];
        if (region.country_id.toString() !== targetCountryId.toString()) {
          const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
            message: "Region does not belong to the selected country",
            data: { region_id: targetRegionId, country_id: targetCountryId },
          });
          throwError("region_not_belonging", response);
        }
      }

      // Check if district exists and check relation if region_id or district_id is updated
      if (body.district_id || body.region_id) {
        const districts = await findDistrictHelperService.execute(
          { _id: targetDistrictId } as any,
          districtErrorsMessages,
          { throwIfNotFound: true, lean: true, returnDocument: true, session },
        );
        const district = districts[0];
        if (district.region_id.toString() !== targetRegionId.toString()) {
          const response = ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
            message: "District does not belong to the selected region",
            data: { district_id: targetDistrictId, region_id: targetRegionId },
          });
          throwError("district_not_belonging", response);
        }
      }

      // Check duplicate name or code within the target district (excluding self)
      const nameChanged = body.name !== undefined && body.name !== existing[0].name;
      const codeChanged = body.code !== undefined && body.code.toUpperCase() !== existing[0].code;
      if (nameChanged || codeChanged || body.district_id) {
        const queryOr: any[] = [];
        if (nameChanged && body.name !== undefined) queryOr.push({ name: body.name });
        if (codeChanged && body.code !== undefined) queryOr.push({ code: body.code.toUpperCase() });
        if (!nameChanged && !codeChanged) {
          queryOr.push({ name: existing[0].name });
          queryOr.push({ code: existing[0].code });
        }

        await findSuburbHelperService.execute(
          {
            district_id: targetDistrictId,
            $or: queryOr,
            _id: { $ne: id },
          } as any,
          suburbErrorsMessages,
          {
            throwIfExists: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      const updated = await updateSuburbHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        suburbErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return suburbPayload(
        "suburb_updated",
        suburbResponse(updated),
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

export default new updateSuburbsService();
