import Joi from "joi";
import { IInputDistrictPayloadStrict } from "./payloads/create-district.payload";
import { objectIdValidator } from "@/utils/responses/error.response";

export const districtInputValidator = Joi.object<IInputDistrictPayloadStrict>({
    name: Joi.string().trim().min(1).max(100).required(),
    code: Joi.string().trim().min(1).max(10).required(),
    country_id: Joi.string().custom(objectIdValidator).required(),
    region_id: Joi.string().custom(objectIdValidator).required(),
});

export const updateDistrictInputValidator = Joi.object<IInputDistrictPayloadStrict>({
    name: Joi.string().trim().min(1).max(100).required(),
    code: Joi.string().trim().min(1).max(10).required(),
    country_id: Joi.string().custom(objectIdValidator).required(),
    region_id: Joi.string().custom(objectIdValidator).required(),
});

export const deleteDistrictInputValidator = Joi.object({
    force_action: Joi.boolean().optional(),
});
