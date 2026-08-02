import { IProvider } from "@/database/providers/providers-db-interface";
import { objectIdValidator } from "@/utils/responses/error.response";
import Joi from "joi";
import mongoose from "mongoose";


const phoneValidator = Joi.string().custom((value, helpers) => {
    console.log("Phone validator called with value:", value);
    const { countryCode } = helpers.state.ancestors[0];
    if (!countryCode) {
        return helpers.error("any.invalid", {
            message: "countryCode is required for phone validation",
        });
    }

    let phoneNumber;

    try {
        phoneNumber = value.startsWith("+")
            ? parsePhoneNumberFromString(value)
            : parsePhoneNumberFromString(value, countryCode);
    } catch (err) {
        return helpers.error("Invalid phone format");
    }

    if (!phoneNumber || !phoneNumber.isValid()) {
        return helpers.error("any.invalid", {
            message: `Invalid phone number for country ${countryCode}`,
        });
    }

    return value;
});

const testLogSchema = Joi.object({
    date: Joi.date().required(),
    result: Joi.string().valid("pass", "fail", "pending").required(),
    details: Joi.string().optional(),
});

const smsPayloadSchema = Joi.object({
    countryCode: Joi.string().trim().uppercase().required(),
    phone: phoneValidator.required(),
    message: Joi.string().required(),
});

const whatsappPayloadSchema = Joi.object({
    countryCode: Joi.string().trim().uppercase().required(),
    phone: phoneValidator.required(),
    templateId: Joi.string().required(),
    variables: Joi.object().required(),
});

const emailPayloadSchema = Joi.object({
    email: Joi.string().email().required(),
    subject: Joi.string().required(),
    body: Joi.string().required(),
});

const typeSchema = Joi.object({
    name: Joi.string().valid("SMS", "WHATSAPP", "EMAIL").required(),

    description: Joi.string().trim().required(),

    payloadSchema: Joi.when("name", {
        switch: [
            { is: "SMS", then: smsPayloadSchema },
            { is: "WHATSAPP", then: whatsappPayloadSchema },
            { is: "EMAIL", then: emailPayloadSchema },
        ],
        otherwise: Joi.forbidden(),
    }),

    is_tested: Joi.forbidden(),
    test_log: Joi.array().items(testLogSchema).default([]),
    is_default: Joi.forbidden(),
    is_active: Joi.forbidden(),
});

const supportedCountryConfigSchema = Joi.object({
    apiKey: Joi.string().trim().allow(null, "").optional(),
    apiSecret: Joi.string().trim().allow(null, "").optional(),
    authToken: Joi.string().trim().allow(null, "").optional(),
    senderId: Joi.string().trim().allow(null, "").optional(),
    username: Joi.string().trim().allow(null, "").optional(),
    password: Joi.string().trim().allow(null, "").optional(),
    baseUrl: Joi.string().trim().allow(null, "").optional(),
    apiVersion: Joi.string().trim().allow(null, "").optional(),
    additionalConfig: Joi.object().unknown(true).optional(),
}).optional();

const supportedCountrySchema = Joi.object({
    countryId: Joi.string()
        .custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error("any.invalid");
            }
            return value;
        })
        .required(),

    countryCode: Joi.string().trim().uppercase().required(),

    config: supportedCountryConfigSchema,

    type: Joi.array().items(typeSchema).min(1).required(),

    supportFrom: Joi.date().optional(),
    supportUntil: Joi.date().optional(),

    is_tested: Joi.forbidden(),
    is_active: Joi.forbidden(),
});

export const providerInputValidator = Joi.object<IProvider>({
    name: Joi.string().trim().min(3).max(255).uppercase().required(),
});

export const updateProviderInputValidator = Joi.object<IProvider>({
    name: Joi.string().trim().min(3).max(255).uppercase().optional(),
    supportedCountries: Joi.array().items(supportedCountrySchema).optional(),

});

export const deleteProviderInputValidator = Joi.object({
    force_action: Joi.boolean().optional(),
});
