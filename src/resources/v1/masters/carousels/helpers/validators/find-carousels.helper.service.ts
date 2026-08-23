import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { ICarousel } from "@/database/carousels/carousels-db-interface";
import CarouselModel from "@/database/carousels/carousels-db-model";
import { throwError } from "../../carousels.helper";

export type IFindCarousel = StrictFilterQuery<
  ICarousel & { _id: Types.ObjectId }
>;

class findCarouselsHelperService {
  private readonly repository: Model<ICarousel>;

  constructor() {
    this.repository = CarouselModel;
  }

  public async execute(
    query: IFindCarousel,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<ICarousel>[]> {
    const {
      throwIfExists = false,
      throwIfNotFound = false,
      returnDocument = true,
      lean = false,
      select,
      populate,
      session,
    } = options;

    try {
      let dbQuery: any = this.repository.find(query).session(session || null);

      if (select) {
        dbQuery = dbQuery.select(select);
      }

      if (lean) {
        dbQuery = dbQuery.lean();
      }

      if (populate) {
        dbQuery = dbQuery.populate(populate);
      }

      const documents = await dbQuery;

      if (throwIfExists && documents.length > 0) {
        const response = ResponseBuilder.error(ErrorTypes.CONFLICT, {
          message: "carousel already exists",
          data: query,
          filler: { 0: documents[0].title || documents[0]._id },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "carousel not found",
          data: query,
        });

        throwError("carousels_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<ICarousel>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding carousel", errorMap);
    }
  }
}

export default new findCarouselsHelperService();
