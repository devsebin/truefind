import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import { Types } from "mongoose";
import { CurrencyCode } from "../user-wallet/user-wallet-db-interface";

export type ReconciliationStatus =
    | "matched"
    | "discrepancy"
    | "investigating"
    | "resolved";

export interface IWalletReconciliation extends CommonServiceFieldsInterface {
    provider: string;
    reconciliation_date: Date;
    currency: CurrencyCode;
    external_total_minor: Types.Decimal128;
    ledger_total_minor: Types.Decimal128;
    wallet_total_minor: Types.Decimal128;
    discrepancy_minor: Types.Decimal128;
    status: ReconciliationStatus;
    notes?: string;
}
