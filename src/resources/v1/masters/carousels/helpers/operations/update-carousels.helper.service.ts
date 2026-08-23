import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose, { HydratedDocument } from "mongoose";
import { ICarousel } from "@/database/carousels/carousels-db-interface";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { throwError } from "../../carousels.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { carouselErrorResponse } from "../../carousels.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IInputICarouselPayloadStrict } from "../../payloads/carousel-payload";

class UpdateCarouselHelperService {
  constructor() {}

  public async execute(
    id: mongoose.Types.ObjectId,
    payload: Partial<IInputICarouselPayloadStrict>,
    existing: HydratedDocument<ICarousel>,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ICarousel>> {
    try {
      const changes = updatedFields(payload, existing);
      if (changes.length === 0) {
        const data = carouselErrorResponse(existing);
        throwError(
          "no_change_detected",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "No changes detected",
            data,
            filler: { 0: existing._id },
          }),
        );
      }

      if (payload.slideType !== undefined) existing.slideType = payload.slideType;
      if (payload.title !== undefined) existing.title = payload.title;
      if (payload.description !== undefined) existing.description = payload.description;
      if (payload.image !== undefined) existing.image = payload.image;
      if (payload.target !== undefined) existing.target = payload.target;
      if (payload.button !== undefined) existing.button = payload.button;
      if (payload.colorPattern !== undefined) existing.colorPattern = payload.colorPattern;
      if (payload.redeemCode !== undefined) existing.redeemCode = payload.redeemCode;

      const saved = await existing.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.Carousel,
          apiMethods.PUT,
          operationTypes.Update,
          saved,
          changes,
        ),
      );

      return saved as HydratedDocument<ICarousel>;
    } catch (error) {
      rethrowIfKnown(error, "Error while updating carousel", errorMap);
    }
  }
}

export default new UpdateCarouselHelperService();
