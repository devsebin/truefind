import { IProvider } from "@/database/providers/providers-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { IUpdateProviderPayloadStrict } from "../../payloads/provider-payload";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../providers.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { ProviderResponse } from "../../providers.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class updateProviderHelperService {
  constructor() { }

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: IUpdateProviderPayloadStrict,
    existing: HydratedDocument<IProvider>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IProvider>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = ProviderResponse([existing]);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing.name, 1: existing._id },
          }),
        );
      }

      if (payload.name) {
        existing.name = payload.name;
      }
      if (payload.supportedCountries) {
        existing.supportedCountries = payload.supportedCountries;
      }

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Providers,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<IProvider>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating provider", errorMap);
    }
  }
}

export default new updateProviderHelperService();
