import { Types } from "mongoose";
import { CurrencyCode } from "../user-wallet/user-wallet-db-interface";
import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";

export type LedgerDirection =
    | 'debit'
    | 'credit';

export interface IWalletLedgerEntry
    extends CommonServiceFieldsInterface {
    entry_number: string;
    transaction_id: Types.ObjectId;
    account_id: Types.ObjectId;
    user_id?: Types.ObjectId;
    direction: LedgerDirection;
    amount_minor: Types.Decimal128;
    currency: CurrencyCode;
    balance_before_minor: Types.Decimal128;
    balance_after_minor: Types.Decimal128;
    description?: string;
    reference_type?: string;
    reference_id?: Types.ObjectId;
    metadata?: Record<string, unknown>;
    created_at: Date;
}