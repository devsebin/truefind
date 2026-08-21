import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";


export type CurrencyCode =
    | 'INR'
    | 'NZD'
    | 'USD'
    | 'AUD'
    | 'GBP';

export type WalletStatus =
    | 'active'
    | 'frozen'
    | 'suspended'
    | 'closed';


export interface IWallet extends CommonServiceFieldsInterface {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
    wallet_number: string;
    status: WalletStatus;
    default_currency?: CurrencyCode;
}