import Joi from "joi";
import { IInputICarouselPayloadStrict } from "./payloads/carousel-payload";

const targetValidator = Joi.object({
  type: Joi.string()
    .valid(
      "everyone",
      "userIds",
      "userType",
      "country",
      "newUser",
      "allVerifiedUser",
      "vipUser",
      "newFreeUser",
      "newVipUser",
    )
    .default("everyone"),
  value: Joi.any().optional(),
});

const buttonValidator = Joi.object({
  text: Joi.string().trim().optional(),
  action: Joi.string().trim().optional(),
  url: Joi.string().uri().trim().optional(),
});

const colorPatternValidator = Joi.object({
  primary: Joi.string().trim().optional(),
  secondary: Joi.string().trim().optional(),
});

export const carouselInputValidator = Joi.object<IInputICarouselPayloadStrict>({
  slideType: Joi.string()
    .valid("promotion", "coupon", "info", "announcement", "banner", "news")
    .required(),
  title: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().optional(),
  image: Joi.string().trim().optional(),
  target: targetValidator.optional(),
  button: buttonValidator.optional(),
  colorPattern: colorPatternValidator.optional(),
  redeemCode: Joi.string().trim().optional(),
}).nand("button", "redeemCode");

export const updateCarouselInputValidator = Joi.object<Partial<IInputICarouselPayloadStrict>>({
  slideType: Joi.string()
    .valid("promotion", "coupon", "info", "announcement", "banner", "news")
    .optional(),
  title: Joi.string().trim().min(1).max(255).optional(),
  description: Joi.string().trim().optional(),
  image: Joi.string().trim().optional(),
  target: targetValidator.optional(),
  button: buttonValidator.optional(),
  colorPattern: colorPatternValidator.optional(),
  redeemCode: Joi.string().trim().optional(),
}).nand("button", "redeemCode");

export const deleteCarouselInputValidator = Joi.object({
  force_action: Joi.boolean().optional(),
});
