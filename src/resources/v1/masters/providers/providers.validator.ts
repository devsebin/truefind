import { IProvider } from "@/database/providers/providers-db-interface";
import { objectIdValidator } from "@/utils/responses/error.response";
import Joi from "joi";

export const providerInputValidator = Joi.object<IProvider>({
    name: Joi.string().trim().min(3).max(255).uppercase().required(),
    supportedCountries: Joi.array().items(
        Joi.object({
            countryId: Joi.string().custom(objectIdValidator).required(),
            countryCode: Joi.string().length(2).uppercase().required(),
            type: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    description: Joi.string().required(),
                    payloadSchema: Joi.object().optional().allow(null),
                    is_tested: Joi.boolean().optional(),
                    test_log: Joi.array().items(
                        Joi.object({
                            date: Joi.date().required(),
                            result: Joi.string().valid("pass", "fail", "pending").required(),
                            details: Joi.string().optional().allow(""),
                        })
                    ).optional(),
                    is_default: Joi.boolean().optional(),
                    is_active: Joi.boolean().optional(),
                })
            ).optional(),
            supportFrom: Joi.date().required(),
            supportUntil: Joi.date().optional().allow(null),
            is_tested: Joi.boolean().optional(),
            is_active: Joi.boolean().optional(),
        })
    ).optional(),
});

export const updateProviderInputValidator = Joi.object<IProvider>({
    name: Joi.string().trim().min(3).max(255).uppercase().optional(),
    supportedCountries: Joi.array().items(
        Joi.object({
            countryId: Joi.string().custom(objectIdValidator).required(),
            countryCode: Joi.string().length(2).uppercase().required(),
            type: Joi.array().items(
                Joi.object({
                    name: Joi.string().required(),
                    description: Joi.string().required(),
                    payloadSchema: Joi.object().optional().allow(null),
                    is_tested: Joi.boolean().optional(),
                    test_log: Joi.array().items(
                        Joi.object({
                            date: Joi.date().required(),
                            result: Joi.string().valid("pass", "fail", "pending").required(),
                            details: Joi.string().optional().allow(""),
                        })
                    ).optional(),
                    is_default: Joi.boolean().optional(),
                    is_active: Joi.boolean().optional(),
                })
            ).optional(),
            supportFrom: Joi.date().required(),
            supportUntil: Joi.date().optional().allow(null),
            is_tested: Joi.boolean().optional(),
            is_active: Joi.boolean().optional(),
        })
    ).optional(),
});

export const deleteProviderInputValidator = Joi.object({
    force_action: Joi.boolean().optional(),
});
