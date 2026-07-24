import Joi from "joi";

export const adminLoginValidation = Joi.object({
    email: Joi.string().email().required(),

    password: Joi.string().trim().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
    }),
    device_id: Joi.string().trim().min(6).required().messages({
        "string.min": "Device ID must be at least 6 characters",
    }),
    device_name: Joi.string().trim().required().messages({
        "string.min": "Device Name is required",
    }),
});

export const refreshTokenValidation = Joi.object({
    refresh_token: Joi.string().trim().required().messages({
        "string.empty": "Refresh token is required",
    }),
    device_id: Joi.string().trim().min(6).required().messages({
        "string.min": "Device ID must be at least 6 characters",
    }),
    device_name: Joi.string().trim().required().messages({
        "string.min": "Device Name is required",
    }),
});