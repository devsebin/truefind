import { objectIdValidator } from "@/utils/responses/error.response";
import Joi from "joi";
import { IUserBasicPayload } from "./payloads/user-input.interface";

export const userBasicValidation = Joi.object<IUserBasicPayload>({
    user_id: Joi.string().optional().custom(objectIdValidator).messages({
        "string.custom": "User ID must be a valid MongoDB ObjectId",
    }),
    first_name: Joi.string().required().min(2).max(100).messages({
        "any.required": "First name is required",
        "string.min": "First name must be at least 2 characters long",
        "string.max": "First name cannot exceed 100 characters",
    }),
    last_name: Joi.string().required().min(2).max(100).messages({
        "any.required": "Last name is required",
        "string.min": "Last name must be at least 2 characters long",
        "string.max": "Last name cannot exceed 100 characters",
    }),
    business_name: Joi.string().optional().min(2).max(100).messages({
        "string.min": "Business name must be at least 2 characters long",
        "string.max": "Business name cannot exceed 100 characters",
    }),
    year_of_experience: Joi.number()
        .optional()
        .min(0)
        .max(100)
        .integer()
        .messages({
            "number.min": "Year of experience must be at least 0",
            "number.max": "Year of experience cannot exceed 100",
        }),
    street_address: Joi.string().optional().min(2).max(100).messages({
        "string.min": "Street address must be at least 2 characters long",
        "string.max": "Street address cannot exceed 100 characters",
    }),
    city: Joi.string().required().min(2).max(100).messages({
        "any.required": "City is required",
        "string.min": "City must be at least 2 characters long",
        "string.max": "City cannot exceed 100 characters",
    }),
    zip: Joi.string().required().min(2).max(100).messages({
        "any.required": "Zip is required",
        "string.min": "Zip must be at least 2 characters long",
        "string.max": "Zip cannot exceed 100 characters",
    }),
    ird_number: Joi.string().required().messages({
        "any.required": "IRD number is required",
    }),
    declaimer_id: Joi.string().required().custom(objectIdValidator).messages({
        "any.required": "Declaimers is required",
        "string.custom": "Declaimers must be a valid MongoDB ObjectId",
    }),
    is_gst_registered: Joi.boolean().optional(),

    gst_number: Joi.when("is_gst_registered", {
        is: true,
        then: Joi.string().required().min(2).max(100),
        otherwise: Joi.string().optional(),
    }).messages({
        "any.required": "GST number is required when GST is registered",
        "string.min": "GST number must be at least 2 characters long",
        "string.max": "GST number cannot exceed 100 characters",
    }),

    region_id: Joi.string().custom(objectIdValidator).messages({
        "string.custom": "Region ID must be a valid MongoDB ObjectId",
    }).required(),
    country_id: Joi.string().custom(objectIdValidator).messages({
        "string.custom": "Country ID must be a valid MongoDB ObjectId",
    }).required(),

    latitude: Joi.number().required().min(-90).max(90).messages({
        "number.min": "Latitude must be between -90 and 90",
        "number.max": "Latitude must be between -90 and 90"
    }),
    longitude: Joi.number().required().min(-180).max(180).messages({
        "number.min": "Longitude must be between -180 and 180",
        "number.max": "Longitude must be between -180 and 180"
    }),


});

export const userLocationValidation = Joi.object({
    latitude: Joi.number().required().min(-90).max(90).messages({
        "number.min": "Latitude must be between -90 and 90",
        "number.max": "Latitude must be between -90 and 90"
    }),
    longitude: Joi.number().required().min(-180).max(180).messages({
        "number.min": "Longitude must be between -180 and 180",
        "number.max": "Longitude must be between -180 and 180"
    }),
});
