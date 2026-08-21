import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";

export interface IPaymentWebhookEvent
    extends CommonServiceFieldsInterface {

    _id: Types.ObjectId;

    provider:
    | 'stripe'
    | 'razorpay'
    | 'adyen'
    | 'paypal'
    | 'other';

    event_id: string;

    event_type: string;

    payload_hash?: string;

    status:
    | 'received'
    | 'processing'
    | 'processed'
    | 'failed';

    attempts: number;

    transaction_id?: Types.ObjectId;

    failure_reason?: string;

    received_at: Date;

    processed_at?: Date;
}