import IRole from "@/database/roles/roles-db-interface";
import Joi from "joi";

export const rolesInputValidator = Joi.object<IRole>({
    title: Joi.string().trim().min(3).max(255).required(),
    label: Joi.string().trim().required(),
    color: Joi.string().trim().required(),
});

export const updateRolesInputValidator = Joi.object<IRole>({
    title: Joi.string().trim().min(3).max(255).optional(),
    label: Joi.string().trim().optional(),
    color: Joi.string().trim().optional(),
});

export const deleteRolesInputValidator = Joi.object({
    force_action: Joi.boolean().optional(),
});
