import { SingleResponse } from "@/utils/responses/success.response";
import { IInputProviderPayloadStrict } from "../payloads/provider-payload";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import { getRequestBody } from "@/utils/helpers/request-body-fetcher.helper";
import { toProviderDTO } from "../dto/create-provider.dto";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { providerErrorsMessages } from "../providers.messages";
import findProviderHelperService from "../helpers/validators/find-provider.helper.service";
import { populateFields, providerPayload } from "../providers.helper";
import createProviderHelperService from "../helpers/operations/create-provider.helper.service";
import { ProviderResponse } from "../providers.response";

class createProvidersService {
  public async execute(
    request: Request,
    payload?: IInputProviderPayloadStrict,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();
    const body = getRequestBody(request, payload, toProviderDTO);

    try {
      session.startTransaction();

      await findProviderHelperService.execute(
        {
          name: body.name,
          is_deleted: false,
          is_active: true
        },
        providerErrorsMessages,
        {
          throwIfExists: true,
          lean: true,
          returnDocument: false,
          session,
        },
      );

      const newProvider = await createProviderHelperService.execute(
        body,
        session,
        DbTransactions,
        providerErrorsMessages,
      );

      await newProvider.populate(populateFields);

      await session.commitTransaction();
      return providerPayload(
        "provider_created",
        ProviderResponse([newProvider])[0],
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

export default new createProvidersService();
