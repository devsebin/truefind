import ICountry from "@/database/countries/countries-db-interface";
import CountryModel from "@/database/countries/countries-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { ICountryDTO } from "../../dto/create-country.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class createCountryHelperService {
  private readonly countryRepository: Model<ICountry>;

  constructor() {
    this.countryRepository = CountryModel;
  }

  public async execute(
    payload: Partial<ICountryDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ICountry>> {
    try {
      const doc = new this.countryRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Countries,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new country", errorMap);
    }
  }
}

export default new createCountryHelperService();
