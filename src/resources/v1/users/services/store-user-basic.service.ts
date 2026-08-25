import { SingleResponse } from "@/utils/responses/success.response";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { Request } from "express";
import mongoose, { ClientSession } from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { usersErrorsMessages } from "../users.messages";
import { userPayload, throwError } from "../users.helper";
import { userResponse } from "../users.response";
import { IUserBasicPayload } from "../payloads/user-input.interface";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import findUserHelperService from "../helpers/validators/find-user.helper.service";
import findDeclaimerHelperService from "@/resources/v1/masters/declaimers/helpers/validators/find-declaimer.helper.service";
import { roleTypes } from "@/utils/definitions/constants/role-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import findSuburbHelperService from "../../masters/suburbs/helpers/validators/find-suburb.helper.service";

class StoreUserBasicService {
  public async execute(
    userId: string,
    request: Request,
    payload?: IUserBasicPayload,
  ): Promise<SingleResponse | ErrorResponse> {
    const DbTransactions: DbTransaction[] = [];
    const session = await mongoose.startSession();

    // Normalize body fetching if payload is not provided
    const body = payload ?? (request.body as IUserBasicPayload);

    try {
      session.startTransaction();

      let targetUserId = userId;
      if (body.user_id) {
        const roleObj = (request.user as any)?.role;
        const currentUserRoleLabel = roleObj && typeof roleObj === "object" ? roleObj.label : roleObj;
        const isAdminOrSuperAdmin =
          currentUserRoleLabel === roleTypes.Admin ||
          currentUserRoleLabel === roleTypes.SuperAdmin;

        if (!isAdminOrSuperAdmin) {
          const response = ResponseBuilder.error(ErrorTypes.UNAUTHORIZED, {
            message: "Forbidden: Only admins can specify a target user ID",
            data: {},
          });
          throwError("forbidden", response);
        }
        targetUserId = body.user_id;
      }

      // 1. Verify declaimer exists
      const declaimers = await findDeclaimerHelperService.execute(
        {
          _id: new mongoose.Types.ObjectId(body.declaimer_id),
          is_deleted: false,
        } as any,
        usersErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );
      const declaimerDoc = declaimers[0];

      // 2. Find and update the user
      const users = await findUserHelperService.execute(
        { _id: new mongoose.Types.ObjectId(targetUserId) } as any,
        usersErrorsMessages,
        { throwIfNotFound: true, returnDocument: true, session },
      );
      const user = users[0];

      // 3. Validate user location against suburb boundaries
      const point = {
        type: "Point",
        coordinates: [body.longitude, body.latitude],
      };

      const suburb = await SuburbModel.findOne({
        boundary: {
          $geoIntersects: {
            $geometry: point,
          },
        },
        post_code: body.zip,
        region_id: new mongoose.Types.ObjectId(body.region_id),
        country_id: new mongoose.Types.ObjectId(body.country_id),
      }).session(session);

      if (!suburb) {
        const response = ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
          message: "Your location is not within any supported suburb",
          data: {},
        });
        throwError("suburb_not_found", response);
      }

      // Set geographic hierarchy based on the matched suburb
      user.country_id = suburb.country_id as mongoose.Types.ObjectId;
      user.region_id = suburb.region_id as mongoose.Types.ObjectId;
      user.district_id = suburb.district_id as mongoose.Types.ObjectId;
      user.suburb_id = suburb._id as mongoose.Types.ObjectId;
      user.location = point as any;

      // 4. Set basic details on user document
      user.first_name = body.first_name;
      user.last_name = body.last_name;

      user.user_basic = {
        first_name: body.first_name,
        last_name: body.last_name,
        business_name: body.business_name || "",
        year_of_experience: body.year_of_experience ?? 0,
        street_address: body.street_address || "",
        city: body.city,
        zip: body.zip,
        ird_number: body.ird_number,
        gst_number: body.gst_number,
        declaimer: body.declaimer_id,
      };

      // 5. Update accepted declaimer in user.declaimer array
      const hasDeclaimer = user.declaimer?.some(
        (d: any) => d.declaimer_id.toString() === body.declaimer_id
      );

      if (!hasDeclaimer) {
        user.declaimer = user.declaimer || [];
        user.declaimer.push({
          declaimer_id: new mongoose.Types.ObjectId(body.declaimer_id),
          accepted: true,
        });
      }

      await user.save({ session });

      // 6. Create DB activity transaction log
      DbTransactions.push(
        await createDbTransaction(
          tableName.User,
          apiMethods.PUT,
          operationTypes.Update,
          user,
        )
      );

      await session.commitTransaction();

      return userPayload(
        "basic_details_updated",
        userResponse(user),
        DbTransactions,
      );
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };
      return buildErrorResult(err.message, usersErrorsMessages, err.data);
    } finally {
      session.endSession();
    }
  }
}

export default new StoreUserBasicService();
