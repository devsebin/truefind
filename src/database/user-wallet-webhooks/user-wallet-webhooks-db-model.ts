import mongoose, { Schema, model, models, Model } from "mongoose";
import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { IPaymentWebhookEvent } from "./user-wallet-webhooks-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";

const PaymentWebhookEventSchema = new Schema<IPaymentWebhookEvent>(
    {
        _id: {
            type: Schema.Types.ObjectId,
            auto: true,
        },

        provider: {
            type: String,
            enum: ["stripe", "razorpay", "adyen", "paypal", "other"],
            required: true,
            index: true,
        },

        event_id: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        event_type: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        payload_hash: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: ["received", "processing", "processed", "failed"],
            required: true,
            default: "received",
            index: true,
        },

        attempts: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        transaction_id: {
            type: Schema.Types.ObjectId,
            index: true,
        },

        failure_reason: {
            type: String,
            trim: true,
        },

        received_at: {
            type: Date,
            required: true,
            default: Date.now,
            index: true,
        },

        processed_at: {
            type: Date,
        },
        status_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: tableName.Status,
        },
        ...CommonServiceFieldsModel
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// A payment provider should not process the same webhook event twice.
PaymentWebhookEventSchema.index(
    { provider: 1, event_id: 1 },
    { unique: true }
);

// Useful for retry/processing workers.
PaymentWebhookEventSchema.index({
    status: 1,
    received_at: 1,
});

export const PaymentWebhookEventModel: Model<IPaymentWebhookEvent> =
    models.PaymentWebhookEvent ||
    model<IPaymentWebhookEvent>(
        tableName.PaymentWebhookEvent,
        PaymentWebhookEventSchema
    );