import IDistrict from "@/database/districts/districts-db-interface";
import DistrictModel from "@/database/districts/districts-db-model";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { IDistrictDTO } from "../../dto/district.dto";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import RegionModel from "@/database/regions/regions-db-model";
import IRegion from "@/database/regions/regions-db-interface";

class createDistrictHelperService {
  private readonly districtRepository: Model<IDistrict>;
  private readonly regionRepository: Model<IRegion>;

  constructor() {
    this.districtRepository = DistrictModel;
    this.regionRepository = RegionModel;
  }

  public async execute(
    payload: Partial<IDistrictDTO>,
    session: mongoose.ClientSession,
    DbTransactions: DbTransaction[],
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<HydratedDocument<IDistrict>> {
    try {
      const doc = new this.districtRepository(payload);
      await doc.save({ session });

      DbTransactions.push(
        await createDbTransaction(
          tableName.Districts,
          apiMethods.POST,
          operationTypes.Create,
          doc.toObject(),
        ),
      );

      const region = await this.regionRepository.findByIdAndUpdate(
        payload.region_id,
        { $push: { district_ids: doc._id } },
        { session },
      );

      if (region) {
        DbTransactions.push(
          await createDbTransaction(
            tableName.Regions,
            apiMethods.PUT,
            operationTypes.Update,
            region.toObject(),
          ),
        );
      }

      return doc;
    } catch (error) {
      rethrowIfKnown(error, "Error while creating new district", errorMap);
    }
  }
}

export default new createDistrictHelperService();
