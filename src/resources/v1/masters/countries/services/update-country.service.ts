import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import { Request } from "express";
import findCountryHelperService from "../helpers/validators/find-country.helper.service";
import { populateFields, countryPayload } from "../countries.helper";
import { countryErrorsMessages } from "../countries.messages";
import updateCountryHelperService from "../helpers/operations/update-country.helper.service";
import { IUpdateICountryPayloadStrict } from "../payloads/country-payload";
import { countryResponse } from "../countries.response";

class updateCountryService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: IUpdateICountryPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findCountryHelperService.execute(
        { _id: id },
        countryErrorsMessages,
        {
          throwIfNotFound: true,
          lean: false,
          returnDocument: true,
          session,
        },
      );

      const body = payload ?? (request.body as IUpdateICountryPayloadStrict);

      // Check duplicates for name, iso_code or iso_code_3 (excluding self)
      const queryOr: any[] = [];
      if (body.name && body.name !== existing[0].name) queryOr.push({ name: body.name });
      if (body.iso_code && body.iso_code !== existing[0].iso_code) queryOr.push({ iso_code: body.iso_code });
      if (body.iso_code_3 && body.iso_code_3 !== existing[0].iso_code_3) queryOr.push({ iso_code_3: body.iso_code_3 });

      if (queryOr.length > 0) {
        await findCountryHelperService.execute(
          {
            $or: queryOr,
            _id: { $ne: id },
          } as any,
          countryErrorsMessages,
          {
            throwIfExists: true,
            lean: true,
            returnDocument: false,
            session,
          },
        );
      }

      const updated = await updateCountryHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        countryErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();

      return countryPayload(
        "country_updated",
        countryResponse(updated),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, countryErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new updateCountryService();
