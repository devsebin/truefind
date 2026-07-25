import Joi from "joi";
import { IInputSuburbPayloadStrict } from "./payloads/create-suburb.payload";
import { objectIdValidator } from "@/utils/responses/error.response";

export const suburbInputValidator = Joi.object<IInputSuburbPayloadStrict>({
    name: Joi.string().trim().min(1).max(100).required(),
    code: Joi.string().trim().min(1).max(10).required(),
    country_id: Joi.string().custom(objectIdValidator).required(),
    region_id: Joi.string().custom(objectIdValidator).required(),
    district_id: Joi.string().custom(objectIdValidator).required(),
    post_code: Joi.string().trim().min(4).max(6).required(),
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
});

export const updateSuburbInputValidator = Joi.object<Partial<IInputSuburbPayloadStrict>>({
    name: Joi.string().trim().min(1).max(100).optional(),
    code: Joi.string().trim().min(1).max(10).optional(),
    country_id: Joi.string().custom(objectIdValidator).optional(),
    region_id: Joi.string().custom(objectIdValidator).optional(),
    district_id: Joi.string().custom(objectIdValidator).optional(),
    post_code: Joi.string().trim().allow("", null).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
});

export const deleteSuburbInputValidator = Joi.object({
    force_action: Joi.boolean().optional(),
});
