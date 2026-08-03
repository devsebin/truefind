import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import mongoose, { Types } from "mongoose";

/**
 * Enum for test results to enforce consistency.
 */
export type TestResult = "pass" | "fail" | "pending";

/**
 * Represents a log entry for a type test.
 */
export interface ITestLog {
    date: Date;
    result: TestResult;
    details?: string;
}

/**
 * Represents a type of service under a provider.
 */
export interface IType {
    name: string;
    description: string;
    payloadSchema: Record<string, any>; // keep for admin validation if needed
    is_tested: boolean;
    test_log?: ITestLog[]; // optional if is_tested = false
    is_default: boolean;
    is_active: boolean;
}

/**
 * Universal config for each supporting country.
 * Stores setup keys for external API providers.
 */
export interface ISupportedCountryConfig {
    apiKey?: string;
    apiSecret?: string;
    authToken?: string;
    senderId?: string;
    username?: string;
    password?: string;
    baseUrl?: string;
    apiVersion?: string;
    additionalConfig?: Record<string, any>;
}

/**
 * Represents country-level support configuration.
 */
export interface ISupportedCountry {
    countryId: mongoose.Types.ObjectId;
    countryCode: string;
    config?: ISupportedCountryConfig;
    type: IType[];
    supportFrom: Date;
    supportUntil?: Date;
    is_tested?: boolean;
    is_active?: boolean;
}


export interface IProviderDocument extends Document {
    name: string;
    supportedCountries: ISupportedCountry[];
}
/**
 * Full provider interface with system fields.
 */
export interface IProvider extends CommonServiceFieldsInterface {
    name: string;
    supportedCountries: ISupportedCountry[]; // array of countries
}

/**
 * Input DTO for creating/updating a provider.
 */
export interface IInputProvider {
    name: string;
    supportedCountries: Array<{
        countryId: Types.ObjectId;
        countryCode: string; // ✅ ISO (NZ, US, IN, etc.)
        config?: ISupportedCountryConfig;
        type: IType[];
        supportFrom: Date;
        supportUntil?: Date;
        is_tested: boolean;
        is_active: boolean;
    }>;
}
