import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";
import { CurrencyCode } from "../user-wallet/user-wallet-db-interface";
import { TransactionStatus } from "../user-wallet-transactions/user-wallet-transactions-db-interface";

export interface IWalletTransfer extends CommonServiceFieldsInterface {
    transfer_number: string;
    from_account_id: Types.ObjectId;
    to_account_id: Types.ObjectId;
    from_user_id: Types.ObjectId;
    to_user_id: Types.ObjectId;
    currency: CurrencyCode;
    amount_minor: Types.Decimal128;
    fee_minor: Types.Decimal128;
    status: TransactionStatus;
    idempotency_key?: string;
    description?: string;
    completed_at?: Date;
}
