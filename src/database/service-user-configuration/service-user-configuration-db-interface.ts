import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";

export type UserTaskEligibilityStatus =
    | "pending"
    | "verified"
    | "uploaded"
    | "approved"
    | "rejected"
    | "hold";

export interface IUserTaskMapping extends CommonServiceFieldsInterface {
    user_id: Types.ObjectId;
    task_id: Types.ObjectId;
    eligibility_status: UserTaskEligibilityStatus;
}

