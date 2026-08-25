import mongoose, { Schema } from "mongoose";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { IUserTaskMapping } from "./service-user-configuration-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";

// Enum for eligibility status (with correct TypeScript typing)
export const UserTaskEligibilityStatus = [
    "pending",
    "verified",
    "uploaded",
    "approved",
    "rejected",
    "hold",
    "success",
] as const;

export type UserTaskEligibilityStatus =
    (typeof UserTaskEligibilityStatus)[number];

// UserTask Schema
const UserTaskSchema = new Schema<IUserTaskMapping>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: tableName.User,
        },
        task_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: tableName.Services,
        },
        eligibility_status: {
            type: String,
            enum: UserTaskEligibilityStatus,
            default: "pending",
        },
        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Status,
        },
        ...CommonServiceFieldsModel,
    },
    { timestamps: true }
);

UserTaskSchema.plugin(defaultStatusPlugin);
UserTaskSchema.plugin(auditPlugin);

UserTaskSchema.methods.toJSON = function () {
    const countryObject = this.toObject();
    delete countryObject.__v;
    return countryObject;
};

// Create and export the model
const TaskUserMappingModel = mongoose.model<IUserTaskMapping>(
    tableName.ServiceUserConfigurations,
    UserTaskSchema
);

export default TaskUserMappingModel;
