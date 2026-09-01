import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose from "mongoose";
import findCountryHelperService from "../helpers/validators/find-country.helper.service";
import { countryErrorsMessages } from "../countries.messages";
import { countryPayload, throwError } from "../countries.helper";
import activateCountryHelperService from "../helpers/operations/activate-country.helper.service";
import findCountryStateHelperService from "../helpers/validators/find-state.helper.service";
import updateRelatedEntitiesHelperService from "../helpers/operations/update-related-entities.helper.service";
import { policyResolver } from "@/core/enablement/policy/policy-resolver";
import { ruleEngine } from "@/core/enablement/engine/rule-engine";
import { ResponseBuilder, ErrorTypes } from "@/utils/helpers/response-builder";

class enableCountryService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];

    try {
      session.startTransaction();

      const country = await findCountryHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
          is_active: { $in: [true, false] },
        } as any,
        countryErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );

      await findCountryStateHelperService.isAlreadyActive(
        country[0],
        countryErrorsMessages,
      );

      // Check runtime enablement policy for COUNTRY
      const activePolicy = await policyResolver.getActivePolicy("COUNTRY");
      if (activePolicy) {
        const evaluation = await ruleEngine.evaluate(
          activePolicy.rules,
          country[0],
          {
            policyId: activePolicy._id.toString(),
            policyVersion: activePolicy.version,
          }
        );

        if (!evaluation.passed) {
          throwError(
            "not_eligible_for_enablement",
            ResponseBuilder.error(ErrorTypes.BAD_REQUEST, {
              message: "Country is not eligible for enablement under active policy",
              data: evaluation,
            })
          );
        }
      }

      await activateCountryHelperService.execute(
        country[0],
        session,
        userId,
        dbTransactions,
        countryErrorsMessages,
      );

      await updateRelatedEntitiesHelperService.activate(
        country[0],
        session,
        userId,
        dbTransactions,
      );

      await session.commitTransaction();

      return countryPayload("country_activate", country, dbTransactions);
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(err.message, countryErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new enableCountryService();
