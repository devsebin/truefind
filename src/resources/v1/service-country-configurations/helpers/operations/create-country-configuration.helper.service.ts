import { IServiceCountryConfigurationDocument } from "@/database/service-country-configuration/service-country-configuration.interface";
import ServiceCountryConfigurationModel from "@/database/service-country-configuration/service-country-configuration.model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IServiceCountryConfigurationDTO } from "../../dto/service-country-configuration.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";

class CreateCountryConfigurationHelperService {
  private readonly repository: Model<IServiceCountryConfigurationDocument>;

  constructor() {
    this.repository = ServiceCountryConfigurationModel;
  }

  public async execute(
    payload: Partial<IServiceCountryConfigurationDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceCountryConfigurationDocument>> {
    try {
      const doc = new this.repository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.ServiceCountryConfigurations,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );
      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new country configuration", errorMap);
    }
  }
}

export default new CreateCountryConfigurationHelperService();
