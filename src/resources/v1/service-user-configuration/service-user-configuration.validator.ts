import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";
import { UserTaskEligibilityStatus } from "@/database/service-user-configuration/service-user-configuration-db-model";

export const bulkStoreServiceUserConfigValidator = Joi.object({
  user_id: Joi.string()
    .custom(objectIdValidator)
    .optional()
    .messages({
      "string.custom": "user_id must be a valid MongoDB ObjectId",
    }),
  service_ids: Joi.array()
    .items(
      Joi.string()
        .custom(objectIdValidator)
        .required()
        .messages({
          "any.required": "each service id is required",
          "string.custom": "each service id must be a valid MongoDB ObjectId",
        })
    )
    .min(1)
    .required()
    .messages({
      "any.required": "service_ids is required",
      "array.min": "service_ids must contain at least one service id",
    }),
});

export const singleServiceUserConfigValidator = Joi.object({
  user_id: Joi.string()
    .custom(objectIdValidator)
    .optional()
    .messages({
      "string.custom": "user_id must be a valid MongoDB ObjectId",
    }),
  service_id: Joi.string()
    .custom(objectIdValidator)
    .required()
    .messages({
      "any.required": "service_id is required",
      "string.custom": "service_id must be a valid MongoDB ObjectId",
    }),
  eligibility_status: Joi.string()
    .valid(...UserTaskEligibilityStatus)
    .optional()
    .messages({
      "any.only": `eligibility_status must be one of [${UserTaskEligibilityStatus.join(", ")}]`,
    }),
});

export const updateServiceUserConfigValidator = Joi.object({
  eligibility_status: Joi.string()
    .valid(...UserTaskEligibilityStatus)
    .optional()
    .messages({
      "any.only": `eligibility_status must be one of [${UserTaskEligibilityStatus.join(", ")}]`,
    }),
  is_active: Joi.boolean().optional(),
});

export const deleteServiceUserConfigValidator = Joi.object({
  force_action: Joi.boolean().optional(),
});
