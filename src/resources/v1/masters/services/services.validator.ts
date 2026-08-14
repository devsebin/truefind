import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";
import { Request, Response, NextFunction } from "express";
import { BaseServiceModel } from "@/database/services/services-db-model";
import { serviceTypes } from "@/utils/definitions/constants/service-types";

export const serviceCategoryValidationSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  icon: Joi.string().required().custom(objectIdValidator).messages({
    "any.required": "icon is required",
    "string.custom": "icon must be a valid MongoDB ObjectId",
  }),
});

export const serviceSubCategoryValidationSchema = Joi.object({
  parent_id: Joi.string().required().custom(objectIdValidator).messages({
    "any.required": "parent_id is required",
    "string.custom": "parent_id must be a valid MongoDB ObjectId",
  }),
  name: Joi.string().required(),
  description: Joi.string().required(),
  icon: Joi.string().required().custom(objectIdValidator).messages({
    "any.required": "icon is required",
    "string.custom": "icon must be a valid MongoDB ObjectId",
  }),
});

export const serviceTaskValidationSchema = Joi.object({
  parent_id: Joi.string().required().custom(objectIdValidator).messages({
    "any.required": "parent_id is required",
    "string.custom": "parent_id must be a valid MongoDB ObjectId",
  }),
  name: Joi.string().required(),
  description: Joi.string().required().min(2),
  icon: Joi.string().required().custom(objectIdValidator).messages({
    "any.required": "icon is required",
    "string.custom": "icon must be a valid MongoDB ObjectId",
  }),
  estimated_time: Joi.number().required(),
  estimated_time_unit: Joi.string().required(),
});

export const categoryParamValidation = Joi.object({
  show_inactive_categories: Joi.boolean().required().default(false),
  show_inactive_subcategories: Joi.boolean().required().default(false),
  show_inactive_services: Joi.boolean().required().default(false),
  remove_empty_categories: Joi.boolean().required().default(false),
  remove_empty_sub_category: Joi.boolean().required().default(false),
});

/* Update validation schemas */

export const serviceCategoryUpdateValidationSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  icon: Joi.string().optional().custom(objectIdValidator).messages({
    "string.custom": "icon must be a valid MongoDB ObjectId",
  }),
});

export const serviceSubCategoryUpdateValidationSchema = Joi.object({
  parent_id: Joi.string().optional().custom(objectIdValidator).messages({
    "string.custom": "parent_id must be a valid MongoDB ObjectId",
  }),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  icon: Joi.string().optional().custom(objectIdValidator).messages({
    "string.custom": "icon must be a valid MongoDB ObjectId",
  }),
});

export const serviceTaskUpdateValidationSchema = Joi.object({
  parent_id: Joi.string().optional().custom(objectIdValidator).messages({
    "string.custom": "parent_id must be a valid MongoDB ObjectId",
  }),
  name: Joi.string().optional(),
  description: Joi.string().optional().allow(""),
  icon: Joi.string().optional().custom(objectIdValidator).messages({
    "string.custom": "icon must be a valid MongoDB ObjectId",
  }),
  estimated_time: Joi.number().optional(),
  estimated_time_unit: Joi.string().optional(),
  task_unit: Joi.string().optional().custom(objectIdValidator),
  priority_id: Joi.string().optional().custom(objectIdValidator),
});

/* Dynamic update validator middleware */

export const serviceEntityUpdateValidator = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const validationOptions = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: false,
    convert: true,
  };

  try {
    const existing = await BaseServiceModel.findById(req.params.id);
    if (!existing || existing.is_deleted) {
      res.status(404).json({ message: "Entity not found" });
      return;
    }

    // Attach pre-loaded document to request to avoid querying again
    (req as any).existingEntity = existing;

    let schema: Joi.Schema | undefined;
    if (existing.type === serviceTypes.Category) {
      schema = serviceCategoryUpdateValidationSchema;
    } else if (existing.type === serviceTypes.Subcategory) {
      schema = serviceSubCategoryUpdateValidationSchema;
    } else if (existing.type === serviceTypes.Service) {
      schema = serviceTaskUpdateValidationSchema;
    }

    if (schema) {
      const { error, value } = schema.validate(req.body, validationOptions);
      if (error) {
        const errors: Record<string, string> = {};
        error.details.forEach((err) => {
          errors[err.context?.key || err.path.join(".")] = err.message;
        });
        res.status(400).json({ errors });
        return;
      }
      req.body = value;
    }
    next();
  } catch (err) {
    next(err);
  }
};
