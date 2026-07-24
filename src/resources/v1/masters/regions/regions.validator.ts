import Joi from "joi";
import { IInputRegionPayloadStrict } from "./payloads/create-region.payload";
import { objectIdValidator } from "@/utils/responses/error.response";

export const regionInputValidator = Joi.object<IInputRegionPayloadStrict>({
    name: Joi.string().trim().min(1).max(100).required(),
    code: Joi.string().trim().min(1).max(10).required(),
    country_id: Joi.string().custom(objectIdValidator).required(),
});

export const updateRegionInputValidator = Joi.object<IInputRegionPayloadStrict>({
    name: Joi.string().trim().min(1).max(100).required(),
    code: Joi.string().trim().min(1).max(10).required(),
    country_id: Joi.string().custom(objectIdValidator).required(),
});

export const deleteRegionInputValidator = Joi.object({
    force_action: Joi.boolean().optional(),
});
