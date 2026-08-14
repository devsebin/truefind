import mongoose, { HydratedDocument, Model, Types } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IBaseFindOptions } from "@/utils/interfaces/base-find-query.interface";
import StrictFilterQuery from "@/utils/helpers/query-filter";
import { ICurrency } from "@/database/currencies/currencies-db-interface";
import { CurrencyModel } from "@/database/currencies/currencies-db-model";
import { throwError } from "../../currencies.helper";

export type IFindCurrency = StrictFilterQuery<
  ICurrency & { _id: Types.ObjectId }
>;

class FindCurrencyHelperService {
  private readonly repository: Model<ICurrency>;

  constructor() {
    this.repository = CurrencyModel;
  }

  public async execute(
    query: IFindCurrency,
    errorMap: Record<string, { message: string; status: number }>,
    options: IBaseFindOptions & {
      session?: mongoose.ClientSession;
    } = {},
  ): Promise<HydratedDocument<ICurrency>[]> {
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
          message: "currency already exists",
          data: query,
        });

        throwError("already_exists", response);
      }

      if (throwIfNotFound && documents.length === 0) {
        const response = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
          message: "currency not found",
          data: query,
        });

        throwError("currency_not_found", response);
      }

      if (!returnDocument) {
        return [];
      }

      return documents as HydratedDocument<ICurrency>[];
    } catch (error) {
      rethrowIfKnown(error, "Error while finding currency", errorMap);
    }
  }
}

export default new FindCurrencyHelperService();
