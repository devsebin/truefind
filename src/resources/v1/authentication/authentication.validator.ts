import { objectIdValidator } from "@/utils/responses/error.response";
import Joi from "joi";
import { parsePhoneNumberFromString } from "libphonenumber-js";


const phoneField = Joi.string()
    .trim()
    .required()
    .custom((value, helpers) => {
        const { country } = helpers.state.ancestors[0];
        if (!country) {
            return helpers.error("phone.countryRequired");
        }

        let phoneNumber;

        try {
            phoneNumber = value.startsWith("+")
                ? parsePhoneNumberFromString(value)
                : parsePhoneNumberFromString(value, country);
        } catch (err) {
            return helpers.error("phone.invalidFormat");
        }

        if (!phoneNumber || !phoneNumber.isValid()) {
            return helpers.error("phone.invalid");
        }

        return phoneNumber.number; // normalized E.164
    })
    .messages({
        "phone.countryRequired": "Country is required for phone validation",
        "phone.invalidFormat": "Invalid phone format",
        "phone.invalid": "Invalid phone number",
    });


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

const declaimerValidation = Joi.object({
    declaimer_id: Joi.string().custom(objectIdValidator).required(),
    accepted: Joi.boolean().valid(true).required().messages({
        "any.only": "Declaimer must be accepted",
    }),
});
/* ------------------ Main Validation ------------------ */
export const sendOtpValidation = Joi.object({
    phone: phoneField,
    country: Joi.string().length(2).uppercase().required().messages({
        "string.length": "Country must be ISO 2-letter code",
    }),
    type: Joi.string().valid("login", "register").required().messages({
        "any.only": "Type must be 'login' or 'register'",
    }),
    device_id: Joi.string().required().messages({
        "any.required": "Device ID is required",
    }),
    user_type: Joi.string().valid("user", "admin", "employee").required(),
    declaimers: Joi.when("type", {
        is: "register",
        then: Joi.array().items(declaimerValidation).min(1).required(),
        otherwise: Joi.forbidden(),
    }),
}).messages({
    "any.required": "{{#label}} is required",
});

export const verifyOtpValidation = Joi.object({
    otp: Joi.string().length(6).required().messages({
        "string.length": "OTP must be 6 digits",
    }),
});

