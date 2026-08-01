import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { providerErrorsMessages } from "../providers.messages";
import findProviderHelperService from "../helpers/validators/find-provider.helper.service";
import { populateFields, providerPayload } from "../providers.helper";
import { ProviderResponse } from "../providers.response";

class showProvidersService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    try {
      const documents = await findProviderHelperService.execute(
        {
          _id: id,
          is_deleted: false,
        },
        providerErrorsMessages,
        {
          throwIfNotFound: true,
          populate: populateFields,
        },
      );

      return providerPayload("provider_fetched", ProviderResponse([documents[0]])[0]);
    } catch (error) {
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, providerErrorsMessages, err.data);
    }
  }
}

export default new showProvidersService();
