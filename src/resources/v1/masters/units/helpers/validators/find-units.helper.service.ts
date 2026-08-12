import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import IUnits from "@/database/units/units-db-interface";
import UnitsModel from "@/database/units/units-db-model";
import { throwError } from "../../units.helper";

export type IFindUnits = StrictFilterQuery<
  IUnits & { _id: Types.ObjectId }
>;

class findUnitsHelperService {
  private readonly unitsRepository: Model<IUnits>;

  constructor() {
    this.unitsRepository = UnitsModel;
  }

  public async execute(
    query: IFindUnits,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<IUnits>[]> {
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
      let dbQuery: any = this.unitsRepository.find(query).session(session || null);

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
          message: "unit already exists",
          data: query,
          filler: { 0: documents[0].title },
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "unit not found",
          data: query,
        });

        throwError("units_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<IUnits>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding unit", errorMap);
    }
  }
}

export default new findUnitsHelperService();
