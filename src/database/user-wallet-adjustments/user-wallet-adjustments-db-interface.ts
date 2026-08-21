import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";
import { CurrencyCode } from "../user-wallet/user-wallet-db-interface";
import { LedgerDirection } from "../user-wallet-ledgers/user-wallet-ledgers-db-interface";

export type AdjustmentStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "completed";

export interface IWalletAdjustment extends CommonServiceFieldsInterface {
    wallet_id: Types.ObjectId;
    account_id: Types.ObjectId;
    transaction_id?: Types.ObjectId;
    amount_minor: Types.Decimal128;
    currency: CurrencyCode;
    direction: LedgerDirection;
    reason: string;
    requested_by: Types.ObjectId;
    approved_by?: Types.ObjectId;
    status: AdjustmentStatus;
    completed_at?: Date;
}
