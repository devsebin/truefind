import { ClientSession, HydratedDocument } from "mongoose";
import UserModel from "@/database/users/users-db-model";
import { IUser } from "@/database/users/users-db-interface";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { throwError } from "../users.helper";
import { usersErrorsMessages } from "../users.messages";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { IInputUserPayload } from "../payloads/user-input.interface";

class CreateUserService {
    public async execute(
        user: IInputUserPayload,
        session: ClientSession,
        dbTransactions: DbTransaction[],
    ): Promise<HydratedDocument<IUser>> {
        try {
            const doc = await UserModel.create([user], { session });
            if (!doc || doc.length === 0) {
                const response = ResponseBuilder.error(
                    ErrorTypes.INTERNAL_SERVER_ERROR,
                    {
                        message: "Error while creating user",
                    },
                );
                throwError("already_exists" as any, response);
            }

            const userDocument = doc[0];

            dbTransactions.push(
                await createDbTransaction(
                    tableName.User,
                    apiMethods.POST,
                    operationTypes.Create,
                    userDocument,
                ),
            );

            return userDocument;
        } catch (error) {
            rethrowIfKnown(error, "Error creating user", usersErrorsMessages);
        }
    }
}

export default new CreateUserService();
