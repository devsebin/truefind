import { IServiceInformation } from "@/database/service-informations/service-information-db-interface";
import ServiceInformationModel from "@/database/service-informations/service-information-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { ServiceInformationDTO } from "../../dto/service-information.dto";

class CreateServiceInformationHelperService {
  private readonly repository: Model<IServiceInformation>;

  constructor() {
    this.repository = ServiceInformationModel;
  }

  public async execute(
    data: ServiceInformationDTO,
    userId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    dbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IServiceInformation>> {
    try {
      const docData: any = {
        service_id: data.service_id,
        how_it_works: data.how_it_works || [],
        included_items: data.included_items || [],
        insurance_coverage: data.insurance_coverage,
        faqs: data.faqs || [],
        disclaimers: data.disclaimers || [],
        ...(userId ? { created_by: userId, updated_by: userId } : {}),
      };

      const newInfo = new this.repository(docData);
      const savedInfo = await newInfo.save({ session });

      dbTransactions.push(
        await createDbTransaction(
          tableName.ServiceInformation,
          apiMethods.POST,
          operationTypes.Create,
          savedInfo,
        ),
      );

      return savedInfo as HydratedDocument<IServiceInformation>;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating service information", errorMap);
    }
  }
}

export default new CreateServiceInformationHelperService();
