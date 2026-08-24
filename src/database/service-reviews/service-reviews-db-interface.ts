import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Document, Types } from "mongoose";

export interface IServiceReview
    extends CommonServiceFieldsInterface,
    Document {
    service_id: Types.ObjectId;
    user_id: Types.ObjectId;
    booking_id?: Types.ObjectId;
    rating: number;
    comment?: string;
    status: "pending" | "approved" | "rejected";
    is_verified: boolean;
    provider_id?: Types.ObjectId;
    moderated_at?: Date;
    moderated_by?: Types.ObjectId;
}