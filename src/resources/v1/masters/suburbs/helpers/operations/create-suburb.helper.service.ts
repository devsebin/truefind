import ISuburb from "@/database/suburbs/suburbs-db-interface";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { ISuburbDTO } from "../../dto/suburb.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import DistrictModel from "@/database/districts/districts-db-model";
import IDistrict from "@/database/districts/districts-db-interface";

class createSuburbHelperService {
  private readonly suburbRepository: Model<ISuburb>;
  private readonly districtRepository: Model<IDistrict>;

  constructor() {
    this.suburbRepository = SuburbModel;
    this.districtRepository = DistrictModel;
  }

  public async execute(
    payload: Partial<ISuburbDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<ISuburb>> {
    try {
      const doc = new this.suburbRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Suburbs,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );

      const district = await this.districtRepository.findByIdAndUpdate(
        payload.district_id,
        { $push: { suburb_ids: doc._id } },
        { session },
      );

      if (district) {
        DbTransactions.push(
          await createDbTransaction(
            tableName.Districts,
            apiMethods.PUT,
            operationTypes.Update,
            district.toObject(),
          ),
        );
      }

      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new suburb", errorMap);
    }
  }
}

export default new createSuburbHelperService();
