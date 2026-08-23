import { ICarousel } from "@/database/carousels/carousels-db-interface";
import CarouselModel from "@/database/carousels/carousels-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { ICarouselDTO } from "../../dto/create-carousel.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class CreateCarouselHelperService {
  private readonly repository: Model<ICarousel>;

  constructor() {
    this.repository = CarouselModel;
  }

  public async execute(
    payload: Partial<ICarouselDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ICarousel>> {
    try {
      const doc = new this.repository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Carousel,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new carousel", errorMap);
    }
  }
}

export default new CreateCarouselHelperService();
