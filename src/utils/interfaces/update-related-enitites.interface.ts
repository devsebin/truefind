import { Types } from "mongoose";

export interface IActivationRequiredStatuses {
    active: Types.ObjectId;
    parent_deleted: Types.ObjectId;
}
