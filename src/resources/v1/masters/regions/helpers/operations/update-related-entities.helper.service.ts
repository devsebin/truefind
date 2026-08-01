import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose, { Model, HydratedDocument } from "mongoose";
import IRegion from "@/database/regions/regions-db-interface";
import IDistrict from "@/database/districts/districts-db-interface";
import ISuburb from "@/database/suburbs/suburbs-db-interface";
import DistrictModel from "@/database/districts/districts-db-model";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import findStatusHelperService from "../../../statuses/helpers/validators/find-status.helper.service";
import { statusesErrorsMessages } from "../../../statuses/statuses.messages";
import { regionErrorsMessages } from "../../regions.messages";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";

class updateRelatedEntitiesHelperService {
  private districtModel: Model<IDistrict>;
  private suburbModel: Model<ISuburb>;
  private relatedModels: Model<any>[];

  constructor() {
    this.districtModel = DistrictModel;
    this.suburbModel = SuburbModel;

    this.relatedModels = [
      this.districtModel,
      this.suburbModel,
    ];
  }

  // Deactivates districts and suburbs when the region is disabled or deleted
  public async deactivate(
    region: HydratedDocument<IRegion>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
    statusLabel: "parent_disabled" | "parent_deleted",
  ): Promise<void> {
    try {
      const statuses = await findStatusHelperService.execute(
        { label: statusLabel, is_active: true },
        statusesErrorsMessages,
        { throwIfNotFound: false, session }
      );
      let targetStatusId = statuses && statuses.length > 0 ? statuses[0]._id : undefined;

      if (!targetStatusId) {
        const defaultStatuses = await findStatusHelperService.execute(
          { is_default: true, is_active: true },
          statusesErrorsMessages,
          { throwIfNotFound: false, session }
        );
        if (defaultStatuses && defaultStatuses.length > 0) {
          targetStatusId = defaultStatuses[0]._id;
        }
      }

      for (const model of this.relatedModels) {
        const relatedEntities = await model
          .find({
            region_id: region._id,
            is_active: true,
            is_deleted: false,
          })
          .session(session);

        for (const entity of relatedEntities) {
          const snapshot = entity.toObject();

          entity.is_active = false;
          if (targetStatusId) {
            entity.status_id = targetStatusId;
          }
          entity.updated_by = userId;

          await entity.save({ session });

          const changes = updatedFields(entity.toObject(), snapshot);

          dbTransactions.push(
            await createDbTransaction(
              model.modelName,
              apiMethods.PATCH,
              operationTypes.Update,
              entity,
              changes,
            ),
          );
        }
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating region related entities", regionErrorsMessages);
    }
  }

  // Activates districts and suburbs when the region is enabled/activated
  public async activate(
    region: HydratedDocument<IRegion>,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
  ): Promise<void> {
    try {
      const parentDisabledStatuses = await findStatusHelperService.execute(
        { label: "parent_disabled", is_active: true },
        statusesErrorsMessages,
        { throwIfNotFound: false, session }
      );
      const parentDisabledStatusId = parentDisabledStatuses && parentDisabledStatuses.length > 0 ? parentDisabledStatuses[0]._id : undefined;

      const parentDeletedStatuses = await findStatusHelperService.execute(
        { label: "parent_deleted", is_active: true },
        statusesErrorsMessages,
        { throwIfNotFound: false, session }
      );
      const parentDeletedStatusId = parentDeletedStatuses && parentDeletedStatuses.length > 0 ? parentDeletedStatuses[0]._id : undefined;

      const activeStatuses = await findStatusHelperService.execute(
        { label: "active", is_active: true },
        statusesErrorsMessages,
        { throwIfNotFound: false, session }
      );
      let activeStatusId = activeStatuses && activeStatuses.length > 0 ? activeStatuses[0]._id : undefined;

      if (!activeStatusId) {
        const defaultStatuses = await findStatusHelperService.execute(
          { is_default: true, is_active: true },
          statusesErrorsMessages,
          { throwIfNotFound: false, session }
        );
        if (defaultStatuses && defaultStatuses.length > 0) {
          activeStatusId = defaultStatuses[0]._id;
        }
      }

      const statusIds = [parentDisabledStatusId, parentDeletedStatusId].filter(Boolean);

      for (const model of this.relatedModels) {
        const queryConditions: any = {
          region_id: region._id,
          is_active: false,
          is_deleted: false,
        };

        if (statusIds.length > 0) {
          queryConditions.status_id = { $in: statusIds };
        }

        const relatedEntities = await model
          .find(queryConditions)
          .session(session);

        for (const entity of relatedEntities) {
          const snapshot = entity.toObject();

          entity.is_active = true;
          if (activeStatusId) {
            entity.status_id = activeStatusId;
          }
          entity.updated_by = userId;

          await entity.save({ session });

          const changes = updatedFields(entity.toObject(), snapshot);

          dbTransactions.push(
            await createDbTransaction(
              model.modelName,
              apiMethods.PATCH,
              operationTypes.Update,
              entity,
              changes,
            ),
          );
        }
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while activating region related entities", regionErrorsMessages);
    }
  }
}

export default new updateRelatedEntitiesHelperService();
