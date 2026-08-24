import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";

const howItWorksSchema = Joi.object({
  step: Joi.number().integer().min(1).required().messages({
    "any.required": "how_it_works.step is required",
    "number.base": "how_it_works.step must be a number",
    "number.min": "how_it_works.step must be at least 1",
  }),
  title: Joi.string().trim().max(255).required().messages({
    "any.required": "how_it_works.title is required",
    "string.empty": "how_it_works.title cannot be empty",
    "string.max": "how_it_works.title cannot exceed 255 characters",
  }),
  description: Joi.string().trim().required().messages({
    "any.required": "how_it_works.description is required",
    "string.empty": "how_it_works.description cannot be empty",
  }),
  sort_order: Joi.number().integer().required().messages({
    "any.required": "how_it_works.sort_order is required",
    "number.base": "how_it_works.sort_order must be a number",
  }),
});

const includedItemSchema = Joi.object({
  title: Joi.string().trim().max(255).required().messages({
    "any.required": "included_items.title is required",
    "string.empty": "included_items.title cannot be empty",
    "string.max": "included_items.title cannot exceed 255 characters",
  }),
  description: Joi.string().trim().allow("").optional(),
  sort_order: Joi.number().integer().required().messages({
    "any.required": "included_items.sort_order is required",
    "number.base": "included_items.sort_order must be a number",
  }),
});

const insuranceCoverageSchema = Joi.object({
  enabled: Joi.boolean().default(false).optional(),
  title: Joi.string().trim().max(255).allow("").optional(),
  description: Joi.string().trim().allow("").optional(),
  coverage_items: Joi.array().items(Joi.string().trim()).default([]).optional(),
  disclaimer: Joi.string().trim().allow("").optional(),
  sort_order: Joi.number().integer().default(0).optional(),
});

const faqSchema = Joi.object({
  question: Joi.string().trim().max(500).required().messages({
    "any.required": "faqs.question is required",
    "string.empty": "faqs.question cannot be empty",
    "string.max": "faqs.question cannot exceed 500 characters",
  }),
  answer: Joi.string().trim().required().messages({
    "any.required": "faqs.answer is required",
    "string.empty": "faqs.answer cannot be empty",
  }),
  sort_order: Joi.number().integer().required().messages({
    "any.required": "faqs.sort_order is required",
    "number.base": "faqs.sort_order must be a number",
  }),
});

const disclaimerSchema = Joi.object({
  title: Joi.string().trim().max(255).allow("").optional(),
  content: Joi.string().trim().required().messages({
    "any.required": "disclaimers.content is required",
    "string.empty": "disclaimers.content cannot be empty",
  }),
  sort_order: Joi.number().integer().required().messages({
    "any.required": "disclaimers.sort_order is required",
    "number.base": "disclaimers.sort_order must be a number",
  }),
});

// Helper validation functions for unique sort orders & steps
const validateUniqueSortOrders = (value: any, helpers: Joi.CustomHelpers) => {
  if (value.how_it_works && Array.isArray(value.how_it_works)) {
    const steps = value.how_it_works.map((item: any) => item.step);
    if (new Set(steps).size !== steps.length) {
      return helpers.error("custom.duplicateHowItWorksStep");
    }
    const sortOrders = value.how_it_works.map((item: any) => item.sort_order);
    if (new Set(sortOrders).size !== sortOrders.length) {
      return helpers.error("custom.duplicateHowItWorksSortOrder");
    }
  }

  if (value.included_items && Array.isArray(value.included_items)) {
    const sortOrders = value.included_items.map((item: any) => item.sort_order);
    if (new Set(sortOrders).size !== sortOrders.length) {
      return helpers.error("custom.duplicateIncludedItemsSortOrder");
    }
  }

  if (value.faqs && Array.isArray(value.faqs)) {
    const sortOrders = value.faqs.map((item: any) => item.sort_order);
    if (new Set(sortOrders).size !== sortOrders.length) {
      return helpers.error("custom.duplicateFaqsSortOrder");
    }
  }

  if (value.disclaimers && Array.isArray(value.disclaimers)) {
    const sortOrders = value.disclaimers.map((item: any) => item.sort_order);
    if (new Set(sortOrders).size !== sortOrders.length) {
      return helpers.error("custom.duplicateDisclaimersSortOrder");
    }
  }

  return value;
};

export const serviceInformationCreateSchema = Joi.object({
  service_id: Joi.string()
    .custom(objectIdValidator)
    .required()
    .messages({
      "any.required": "service_id is required",
      "string.custom": "service_id must be a valid MongoDB ObjectId",
    }),
  how_it_works: Joi.array().items(howItWorksSchema).default([]).optional(),
  included_items: Joi.array().items(includedItemSchema).default([]).optional(),
  insurance_coverage: insuranceCoverageSchema.optional(),
  faqs: Joi.array().items(faqSchema).default([]).optional(),
  disclaimers: Joi.array().items(disclaimerSchema).default([]).optional(),
})
  .custom(validateUniqueSortOrders)
  .messages({
    "custom.duplicateHowItWorksStep": "Duplicate step numbers are not allowed in how_it_works",
    "custom.duplicateHowItWorksSortOrder": "Duplicate sort_order values are not allowed in how_it_works",
    "custom.duplicateIncludedItemsSortOrder": "Duplicate sort_order values are not allowed in included_items",
    "custom.duplicateFaqsSortOrder": "Duplicate sort_order values are not allowed in faqs",
    "custom.duplicateDisclaimersSortOrder": "Duplicate sort_order values are not allowed in disclaimers",
  });

export const serviceInformationUpdateSchema = Joi.object({
  how_it_works: Joi.array().items(howItWorksSchema).optional(),
  included_items: Joi.array().items(includedItemSchema).optional(),
  insurance_coverage: insuranceCoverageSchema.optional(),
  faqs: Joi.array().items(faqSchema).optional(),
  disclaimers: Joi.array().items(disclaimerSchema).optional(),
})
  .custom(validateUniqueSortOrders)
  .messages({
    "custom.duplicateHowItWorksStep": "Duplicate step numbers are not allowed in how_it_works",
    "custom.duplicateHowItWorksSortOrder": "Duplicate sort_order values are not allowed in how_it_works",
    "custom.duplicateIncludedItemsSortOrder": "Duplicate sort_order values are not allowed in included_items",
    "custom.duplicateFaqsSortOrder": "Duplicate sort_order values are not allowed in faqs",
    "custom.duplicateDisclaimersSortOrder": "Duplicate sort_order values are not allowed in disclaimers",
  });
