import IUnits from "@/database/units/units-db-interface";
import Joi from "joi";

export const unitsInputValidator = Joi.object<IUnits>({
    title: Joi.string().trim().min(3).max(255).required(),
    label: Joi.string().trim().required(),
    dimension: Joi.string().trim().required(),
    color: Joi.string().trim().required(),
    is_default: Joi.boolean().optional().default(false),
});

export const updateUnitsInputValidator = Joi.object<IUnits>({
    title: Joi.string().trim().min(3).max(255).optional(),
    label: Joi.string().trim().optional(),
    dimension: Joi.string().trim().optional(),
    color: Joi.string().trim().optional(),
    is_default: Joi.boolean().optional(),
});

export const deleteUnitsInputValidator = Joi.object({
    force_action: Joi.boolean().optional(),
});
