import ICountry from "@/database/countries/countries-db-interface";
import { objectIdValidator } from "@/utils/responses/error.response";
import Joi from "joi";

export const countryInputValidator = Joi.object<ICountry>({
    name: Joi.string().trim().min(3).max(255).uppercase().required(),
    iso_code: Joi.string().length(2).uppercase().required(),
    iso_code_3: Joi.string().length(3).uppercase().required(),
    phone_code: Joi.string().allow(null, "").required(),
    currency: Joi.string().allow(null, "").uppercase().required(),
    continent: Joi.string().allow(null, "").required(),
    timezone: Joi.array().items(Joi.string()).allow(null).required(),
    region_ids: Joi.array().items(Joi.string().custom(objectIdValidator)).optional(),
    flags: Joi.string().optional().custom(objectIdValidator).allow(null, ""),
    providers: Joi.array().items(Joi.string().custom(objectIdValidator)).allow(null).optional(),

});

export const updateCountryInputValidator = Joi.object<ICountry>({
    name: Joi.string().trim().min(3).max(255).uppercase().optional(),
    iso_code: Joi.string().length(2).uppercase().optional(),
    iso_code_3: Joi.string().length(3).uppercase().optional(),
    phone_code: Joi.string().allow(null, "").optional(),
    currency: Joi.string().allow(null, "").uppercase().optional(),
    continent: Joi.string().allow(null, "").optional(),
    timezone: Joi.array().items(Joi.string()).allow(null).optional(),
    region_ids: Joi.array().items(Joi.string().custom(objectIdValidator)).optional(),
    flags: Joi.string().optional().custom(objectIdValidator).allow(null, ""),
    providers: Joi.array().items(Joi.string().custom(objectIdValidator)).allow(null).optional(),
});

export const deleteCountryInputValidator = Joi.object({
    force_action: Joi.boolean().optional(),
});
