import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";
import { CurrencyCode } from "../user-wallet/user-wallet-db-interface";

export type HoldStatus =
    | 'active'
    | 'released'
    | 'captured'
    | 'expired'
    | 'cancelled';

export interface IWalletHold extends CommonServiceFieldsInterface {
    wallet_account_id: Types.ObjectId;
    user_id: Types.ObjectId;
    amount_minor: Types.Decimal128;
    currency: CurrencyCode;
    status: HoldStatus;
    reference_type: string;
    reference_id: Types.ObjectId;
    transaction_id?: Types.ObjectId;
    expires_at?: Date;
    released_at?: Date;
    captured_at?: Date;
}