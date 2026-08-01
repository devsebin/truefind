import { SingleResponse } from "@/utils/responses/success.response";
import { IUpdateProviderPayloadStrict } from "../payloads/provider-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose from "mongoose";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toProviderDTO } from "../dto/create-provider.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { providerErrorsMessages } from "../providers.messages";
import findProviderHelperService from "../helpers/validators/find-provider.helper.service";
import updateProviderHelperService from "../helpers/operations/update-provider.helper.service";
import { populateFields, providerPayload } from "../providers.helper";
import { ProviderResponse } from "../providers.response";

class updateProvidersService {
  public async execute(
    id: mongoose.Types.ObjectId,
    request: Request,
    payload?: IUpdateProviderPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toProviderDTO);

    try {
      session.startTransaction();

      const existing = await findProviderHelperService.execute(
        {
          _id: id,
          is_deleted: false,
        },
        providerErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        },
      );

      await findProviderHelperService.execute(
        {
          name: body.name,
          _id: { $ne: id },
          is_deleted: false,
        },
        providerErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      const updated = await updateProviderHelperService.execute(
        id,
        body,
        existing[0],
        session,
        DbTransactions,
        providerErrorsMessages,
      );

      await updated.populate(populateFields);

      await session.commitTransaction();
      return providerPayload(
        "provider_updated",
        ProviderResponse([updated])[0],
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, providerErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new updateProvidersService();
