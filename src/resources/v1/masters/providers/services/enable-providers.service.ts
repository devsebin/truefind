import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { providerErrorsMessages } from "../providers.messages";
import findProviderHelperService from "../helpers/validators/find-provider.helper.service";
import activateProviderHelperService from "../helpers/operations/activate-provider.helper.service";
import { populateFields, providerPayload } from "../providers.helper";
import { ProviderResponse } from "../providers.response";

class enableProvidersService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existing = await findProviderHelperService.execute(
        {
          _id: id,
        },
        providerErrorsMessages,
        {
          throwIfNotFound: true,
          session,
        },
      );

      const activated = await activateProviderHelperService.execute(
        existing[0],
        session,
        userId,
        DbTransactions,
        providerErrorsMessages,
      );

      await activated.populate(populateFields);

      await session.commitTransaction();
      return providerPayload(
        "provider_activate",
        ProviderResponse([activated])[0],
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

export default new enableProvidersService();
