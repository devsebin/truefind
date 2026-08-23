import { ICarousel } from "@/database/carousels/carousels-db-interface";
import mongoose, { HydratedDocument } from "mongoose";
import { throwError } from "../../carousels.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { carouselErrorResponse } from "../../carousels.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class DeactivateCarouselHelperService {
  constructor() {}

  public async execute(
    existing: HydratedDocument<ICarousel>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ICarousel>> {
    try {
      if (!existing.is_active || existing.is_deleted) {
        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "Carousel is already inactive",
            data: carouselErrorResponse(existing),
            filler: { 0: existing._id },
          }),
        );
      }

      existing.is_active = false;
      existing.updated_by = userId;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Carousel,
          apiMethods.PATCH,
          operationTypes.Update,
          saved,
        ),
      );

      return saved as HydratedDocument<ICarousel>;
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating carousel", errorMap);
    }
  }
}

export default new DeactivateCarouselHelperService();
