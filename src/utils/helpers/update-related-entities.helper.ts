import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { updatedFields } from "@/utils/helpers/update-finder.helper";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import ICountry from "@/database/countries/countries-db-interface";
import { countryErrorsMessages } from "@/resources/v1/masters/countries/countries.messages";
import { IActivationRequiredStatuses } from "../interfaces/update-related-enitites.interface";

class updateRelatedEntitiesHelperService {
    async execute(
        country: HydratedDocument<ICountry>,
        statuses: IActivationRequiredStatuses,
        models: Model<any>[],
        session: mongoose.ClientSession,
        DbTransactions: DbTransaction[],
    ): Promise<void> {
        for (const model of models) {
            try {
                const relatedEntities = await model
                    .find({
                        country_id: country._id,
                        is_active: false,
                        status_id: statuses.parent_deleted,
                    })
                    .session(session);

                for (const entity of relatedEntities) {
                    const snapshot = entity.toObject();

                    entity.status_id = statuses.active;
                    entity.is_active = true;
                    entity.updated_by = country.updated_by;

                    await entity.save({ session });

                    const changes = updatedFields(entity.toObject(), snapshot);

                    DbTransactions.push(
                        await createDbTransaction(
                            model.modelName,
                            apiMethods.PATCH,
                            operationTypes.Update,
                            entity,
                            changes,
                        ),
                    );
                }
            } catch (err) {
                rethrowIfKnown(
                    err,
                    `Error while activating related entities of model ${model.modelName}`,
                    countryErrorsMessages,
                );
            }
        }
    }
}

export default new updateRelatedEntitiesHelperService();
