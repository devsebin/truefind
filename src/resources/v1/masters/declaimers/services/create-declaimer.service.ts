import { SingleResponse } from "@/utils/responses/success.response";
import { IInputDeclaimerPayloadStrict } from "../payloads/declaimer-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toDeclaimerDTO } from "../dto/declaimer.dto";
import mongoose, { ClientSession } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { declaimerErrorsMessages } from "../declaimers.messages";
import findCountryHelperService from "../../countries/helpers/validators/find-country.helper.service";
import findDeclaimerHelperService from "../helpers/validators/find-declaimer.helper.service";
import createDeclaimerHelperService from "../helpers/operations/create-declaimer.helper.service";
import { declaimerPayload, populateFields } from "../declaimers.helper";
import { declaimerResponse } from "../declaimers.response";
import DeclaimerModel from "@/database/declaimers/declaimers-db-model";

class createDeclaimerService {
  public async execute(
    request: Request,
    payload?: IInputDeclaimerPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toDeclaimerDTO);

    try {
      session.startTransaction();

      // Validate country code if provided
      let countryId: mongoose.Types.ObjectId | null = null;
      if (body.country) {
        const query = mongoose.Types.ObjectId.isValid(body.country)
          ? { _id: new mongoose.Types.ObjectId(body.country) }
          : { iso_code: body.country.toUpperCase() };

        const countryDocs = await findCountryHelperService.execute(
          query as any,
          declaimerErrorsMessages,
          { throwIfNotFound: true, returnDocument: true, session }
        );
        if (countryDocs && countryDocs.length > 0) {
          countryId = countryDocs[0]._id;
        }
      }

      // Validate declaimer uniqueness
      await findDeclaimerHelperService.execute(
        {
          key: body.key,
          language: body.language,
          country: countryId as any,
          is_deleted: false,
        },
        declaimerErrorsMessages,
        { throwIfExists: true, returnDocument: false, session }
      );

      // Get next version number
      const version = await this.getNextVersion(
        body.key,
        body.language,
        countryId,
        session,
      );

      // Create new declaimer
      const userId = request.user?.id;
      const newDeclaimer = await createDeclaimerHelperService.execute(
        {
          ...body,
          country: countryId ? countryId.toString() : null,
          version,
          created_by: userId,
        },
        session,
        DbTransactions,
        declaimerErrorsMessages,
      );

      await newDeclaimer.populate(populateFields);

      await session.commitTransaction();

      return declaimerPayload(
        "declaimer_created",
        declaimerResponse(newDeclaimer),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, declaimerErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }

  private async getNextVersion(
    key: string,
    language: string,
    country: mongoose.Types.ObjectId | string | null,
    session: ClientSession,
  ): Promise<number> {
    const lastDoc = await DeclaimerModel
      .findOne({ key, language, country })
      .sort({ version: -1 })
      .session(session);

    return lastDoc ? lastDoc.version + 1 : 1;
  }
}

export default new createDeclaimerService();
