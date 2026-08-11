import Joi from "joi";

export const createOtpValidation = Joi.object({
    phone: Joi.string().required(),
});
