import mongoose from "mongoose";
import RegionModel from "@/database/regions/regions-db-model";
import findUserHelperService from "../helpers/validators/find-user.helper.service";
import { Request } from "express";
import { usersErrorsMessages } from "../users.messages";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { getLocationFromCoordinates } from "@/utils/helpers/location.helper";
import { toUserLocationDTO } from "../dto/user-location.dto";
import { userPayload } from "../users.helper";
import { buildErrorResult, ErrorResponse } from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";

class GetUserLocationService {
    public async execute(
        userId: string,
        req: Request,
    ): Promise<SingleResponse | ErrorResponse> {
        const DbTransactions: DbTransaction[] = [];
        const session = await mongoose.startSession();
        try {

            const users = await findUserHelperService.execute(
                { _id: new mongoose.Types.ObjectId(userId) } as any,
                usersErrorsMessages,
                { throwIfNotFound: true, returnDocument: true, session },
            );
            const location = await getLocationFromCoordinates(req.body.latitude, req.body.longitude) as any;
            
            if (location && location.region) {
                const regionDoc = await RegionModel.findOne({ name: location.region, is_active: true, is_deleted: false }).session(session);
                if (regionDoc) {
                    location.region_id = regionDoc._id.toString();
                    location.country_id = regionDoc.country_id.toString();
                }
            }

            const locationDTO = toUserLocationDTO(location);

            return userPayload(
                "location_fetched",
                locationDTO,
                DbTransactions,
            ) as any;
        } catch (error) {
            const err = error as Error & { data?: any };
            return buildErrorResult(err.message, usersErrorsMessages, err.data);
        } finally {
            session.endSession();
        }
    }
}

export default new GetUserLocationService();