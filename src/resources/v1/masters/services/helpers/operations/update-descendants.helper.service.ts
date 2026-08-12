import { BaseServiceModel } from "@/database/services/services-db-model";
import findStatusHelperService from "../../../statuses/helpers/validators/find-status.helper.service";
import { statusesErrorsMessages } from "../../../statuses/statuses.messages";
import { servicesErrorsMessages } from "../../services.messages";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose from "mongoose";

class updateDescendantsHelperService {
  public async deactivate(
    parent: any,
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

      // Recursively deactivate children
      await this.deactivateChildrenRecursive(parent, targetStatusId, session, userId, dbTransactions);
    } catch (error) {
      rethrowIfKnown(error, "Error while deactivating descendants", servicesErrorsMessages);
    }
  }

  private async deactivateChildrenRecursive(
    parent: any,
    targetStatusId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
  ): Promise<void> {
    if (!parent.children || parent.children.length === 0) return;

    for (const childId of parent.children) {
      const child = await BaseServiceModel.findById(childId).session(session);
      if (!child || child.is_deleted) continue;

      if (child.is_active) {
        const snapshot = child.toObject();

        child.is_active = false;
        if (targetStatusId) {
          child.status_id = targetStatusId;
        }
        child.updated_by = userId;

        await child.save({ session });

        const changes = updatedFields(child.toObject(), snapshot);
        dbTransactions.push(
          await createDbTransaction(
            BaseServiceModel.modelName,
            apiMethods.PATCH,
            operationTypes.Update,
            child,
            changes,
          ),
        );
      }

      // Recurse for grandchildren
      await this.deactivateChildrenRecursive(child, targetStatusId, session, userId, dbTransactions);
    }
  }

  public async activate(
    parent: any,
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

      const statusIds = [parentDisabledStatusId, parentDeletedStatusId].filter(Boolean) as mongoose.Types.ObjectId[];

      await this.activateChildrenRecursive(parent, statusIds, activeStatusId, session, userId, dbTransactions);
    } catch (error) {
      rethrowIfKnown(error, "Error while activating descendants", servicesErrorsMessages);
    }
  }

  private async activateChildrenRecursive(
    parent: any,
    statusIds: mongoose.Types.ObjectId[],
    activeStatusId: mongoose.Types.ObjectId | undefined,
    session: mongoose.ClientSession,
    userId: mongoose.Types.ObjectId,
    dbTransactions: DbTransaction[],
  ): Promise<void> {
    if (!parent.children || parent.children.length === 0) return;

    for (const childId of parent.children) {
      const child = await BaseServiceModel.findById(childId).session(session);
      if (!child || child.is_deleted) continue;

      const matchesStatus = statusIds.length === 0 || (child.status_id && statusIds.some(id => id.toString() === child.status_id.toString()));

      if (!child.is_active && matchesStatus) {
        const snapshot = child.toObject();

        child.is_active = true;
        if (activeStatusId) {
          child.status_id = activeStatusId;
        }
        child.updated_by = userId;

        await child.save({ session });

        const changes = updatedFields(child.toObject(), snapshot);
        dbTransactions.push(
          await createDbTransaction(
            BaseServiceModel.modelName,
            apiMethods.PATCH,
            operationTypes.Update,
            child,
            changes,
          ),
        );
      }

      // Recurse for grandchildren
      await this.activateChildrenRecursive(child, statusIds, activeStatusId, session, userId, dbTransactions);
    }
  }
}

export default new updateDescendantsHelperService();
