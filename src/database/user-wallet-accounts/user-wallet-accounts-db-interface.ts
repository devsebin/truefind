import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import mongoose, { Types } from "mongoose";
import { CurrencyCode } from "../user-wallet/user-wallet-db-interface";


export type WalletAccountStatus =
    | 'active'
    | 'frozen'
    | 'suspended'
    | 'closed';

export type AccountType =
    | 'customer_wallet'
    | 'provider_wallet'
    | 'platform_cash'
    | 'platform_revenue'
    | 'platform_fee'
    | 'payment_clearing'
    | 'refund_liability'
    | 'withdrawal_clearing'

export interface IWalletAccount extends CommonServiceFieldsInterface {
    _id: Types.ObjectId;
    wallet_id: Types.ObjectId;
    user_id: Types.ObjectId;
    currency: CurrencyCode;
    account_type: AccountType;
    status: WalletAccountStatus;
    available_balance_minor: mongoose.Types.Decimal128;
    pending_balance_minor: mongoose.Types.Decimal128;
    locked_balance_minor: mongoose.Types.Decimal128;
    version: number;
}