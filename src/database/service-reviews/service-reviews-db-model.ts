import mongoose, { Schema } from "mongoose";
import { tableName } from "@/utils/definitions/constants/table-names";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { IServiceReview } from "./service-reviews-db-interface";

const ServiceReviewSchema =
    new Schema<IServiceReview>(
        {
            service_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.Services,
                required: true,
            },
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.User,
                required: true,
            },
            booking_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.Booking,
            },
            provider_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.Providers,
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },
            comment: {
                type: String,
                trim: true,
                maxlength: 5000,
                default: "",
            },
            status: {
                type: String,
                enum: [
                    "pending",
                    "approved",
                    "rejected",
                ],
                default: "pending",
                index: true,
            },
            is_verified: {
                type: Boolean,
                default: false,
                index: true,
            },
            moderated_at: {
                type: Date,
            },
            moderated_by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.User,
            },
            status_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.Status,
            },
            ...CommonServiceFieldsModel,
        },
        {
            timestamps: true,
        },
    );


/* =========================================================
 * INDEXES
 * ========================================================= */

ServiceReviewSchema.index({
    service_id: 1,
    status: 1,
    createdAt: -1,
});

ServiceReviewSchema.index({
    service_id: 1,
    rating: 1,
});

ServiceReviewSchema.index({
    user_id: 1,
    service_id: 1,
});

ServiceReviewSchema.index({
    booking_id: 1,
});


export const ServiceReviewModel =
    mongoose.model<IServiceReview>(
        tableName.ServiceReview,
        ServiceReviewSchema,
    );


export default ServiceReviewModel;