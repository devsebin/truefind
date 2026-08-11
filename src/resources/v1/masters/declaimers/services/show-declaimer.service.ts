import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findDeclaimerHelperService from "../helpers/validators/find-declaimer.helper.service";
import { declaimerErrorsMessages } from "../declaimers.messages";
import { declaimerPayload, populateFields } from "../declaimers.helper";
import { declaimerResponse } from "../declaimers.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class showDeclaimerService {
  public async execute(
    id: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const dbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const declaimers = await findDeclaimerHelperService.execute(
        { _id: id },
        declaimerErrorsMessages,
        {
          throwIfNotFound: true,
          returnDocument: true,
          populate: populateFields,
          session,
        },
      );

      const declaimer = declaimers[0];

      dbTransactions.push(
        await createDbTransaction(
          tableName.Declaimers,
          apiMethods.GET,
          operationTypes.Read,
          declaimer.toObject(),
        ),
      );

      await session.commitTransaction();

      return declaimerPayload(
        "declaimer_fetched",
        declaimerResponse(declaimer),
        dbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, declaimerErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new showDeclaimerService();
