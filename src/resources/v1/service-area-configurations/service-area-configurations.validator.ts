import Joi from "joi";
import { objectIdValidator } from "@/utils/responses/error.response";
import { timeUnits } from "@/database/services/services-db-interface";

export const serviceAreaBulkOverrideSchema = Joi.object({
  suburbs: Joi.array()
    .items(
      Joi.object({
        // --------------------------------------------------
        // Suburb
        // --------------------------------------------------
        suburb_id: Joi.string()
          .custom(objectIdValidator)
          .required()
          .messages({
            "any.required": "suburb_id is required",
            "string.custom":
              "suburb_id must be a valid MongoDB ObjectId",
          }),

        // --------------------------------------------------
        // General configuration
        // --------------------------------------------------
        required_licenses: Joi.boolean()
          .required()
          .messages({
            "any.required": "required_licenses is required",
          }),

        is_callout_service: Joi.boolean()
          .required()
          .messages({
            "any.required": "is_callout_service is required",
          }),

        is_fixed_price: Joi.boolean()
          .required()
          .when("is_callout_service", {
            is: true,
            then: Joi.valid(false).messages({
              "any.only":
                "is_fixed_price must be false when is_callout_service is true",
            }),
          })
          .messages({
            "any.required": "is_fixed_price is required",
          }),

        // --------------------------------------------------
        // Unit
        //
        // Required for:
        // - Callout service
        // - Fixed-price service
        // - Unit-price service
        // --------------------------------------------------
        unit_id: Joi.string()
          .custom(objectIdValidator)
          .required()
          .messages({
            "any.required": "unit_id is required",
            "string.custom":
              "unit_id must be a valid MongoDB ObjectId",
          }),

        // --------------------------------------------------
        // Fixed-price service
        //
        // is_fixed_price = true
        // => price required
        //
        // is_fixed_price = false
        // => price forbidden
        // --------------------------------------------------
        price: Joi.number()
          .min(0)
          .when("is_fixed_price", {
            is: true,
            then: Joi.required(),
            otherwise: Joi.forbidden(),
          })
          .messages({
            "any.required":
              "price is required when is_fixed_price is true",

            "any.unknown":
              "price is not allowed when is_fixed_price is false",

            "number.base":
              "price must be a number",

            "number.min":
              "price must be greater than or equal to 0",
          }),

        // --------------------------------------------------
        // Unit-price service
        //
        // Allowed only when:
        // is_callout_service = false
        // is_fixed_price = false
        // --------------------------------------------------
        minimum_unit_price: Joi.number()
          .min(0)
          .when("is_callout_service", {
            is: true,
            then: Joi.forbidden(),
            otherwise: Joi.when("is_fixed_price", {
              is: true,
              then: Joi.forbidden(),
              otherwise: Joi.optional(),
            }),
          })
          .messages({
            "any.unknown":
              "minimum_unit_price is only allowed for unit-price services",

            "number.base":
              "minimum_unit_price must be a number",

            "number.min":
              "minimum_unit_price must be greater than or equal to 0",
          }),

        maximum_unit_price: Joi.number()
          .min(0)
          .when("is_callout_service", {
            is: true,
            then: Joi.forbidden(),
            otherwise: Joi.when("is_fixed_price", {
              is: true,
              then: Joi.forbidden(),
              otherwise: Joi.optional(),
            }),
          })
          .messages({
            "any.unknown":
              "maximum_unit_price is only allowed for unit-price services",

            "number.base":
              "maximum_unit_price must be a number",

            "number.min":
              "maximum_unit_price must be greater than or equal to 0",
          }),

        // --------------------------------------------------
        // Callout service
        //
        // is_callout_service = true
        // => call_out_fee required
        //
        // is_callout_service = false
        // => call_out_fee forbidden
        // --------------------------------------------------
        call_out_fee: Joi.number()
          .min(0)
          .when("is_callout_service", {
            is: true,
            then: Joi.required(),
            otherwise: Joi.forbidden(),
          })
          .messages({
            "any.required":
              "call_out_fee is required when is_callout_service is true",

            "any.unknown":
              "call_out_fee is not allowed when is_callout_service is false",

            "number.base":
              "call_out_fee must be a number",

            "number.min":
              "call_out_fee must be greater than or equal to 0",
          }),

        // --------------------------------------------------
        // Estimated time
        // --------------------------------------------------
        estimated_time: Joi.number()
          .min(0)
          .optional()
          .messages({
            "number.base":
              "estimated_time must be a number",

            "number.min":
              "estimated_time must be greater than or equal to 0",
          }),

        estimated_time_unit: Joi.string()
          .valid(...Object.values(timeUnits))
          .optional()
          .messages({
            "any.only":
              "estimated_time_unit must be a valid time unit",
          }),

        // --------------------------------------------------
        // Active status
        // --------------------------------------------------
        is_active: Joi.boolean()
          .required()
          .messages({
            "any.required": "is_active is required",
          }),
      })
        // --------------------------------------------------
        // Cross-field validation
        //
        // minimum_unit_price must not be greater than
        // maximum_unit_price.
        // --------------------------------------------------
        .custom((value, helpers) => {
          const {
            minimum_unit_price,
            maximum_unit_price,
          } = value;

          if (
            minimum_unit_price !== undefined &&
            maximum_unit_price !== undefined &&
            minimum_unit_price > maximum_unit_price
          ) {
            return helpers.error(
              "any.invalid",
              {
                message:
                  "minimum_unit_price must be less than or equal to maximum_unit_price",
              }
            );
          }

          return value;
        })
        .messages({
          "any.invalid":
            "{{#message}}",
        })
    )
    .min(1)
    .required()
    .messages({
      "any.required": "suburbs is required",
      "array.min": "At least one suburb is required",
    }),
});

export const serviceAreaConfigUpdateSchema = Joi.object({
  required_licenses: Joi.boolean()
    .optional()
    .messages({
      "any.required": "required_licenses is required",
    }),

  is_callout_service: Joi.boolean()
    .optional()
    .messages({
      "any.required": "is_callout_service is required",
    }),

  is_fixed_price: Joi.boolean()
    .optional()
    .when("is_callout_service", {
      is: true,
      then: Joi.valid(false).messages({
        "any.only":
          "is_fixed_price must be false when is_callout_service is true",
      }),
    })
    .messages({
      "any.required": "is_fixed_price is required",
    }),

  unit_id: Joi.string()
    .custom(objectIdValidator)
    .optional()
    .messages({
      "string.custom":
        "unit_id must be a valid MongoDB ObjectId",
    }),

  price: Joi.number()
    .min(0)
    .when("is_fixed_price", {
      is: false,
      then: Joi.forbidden(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.unknown":
        "price is not allowed when is_fixed_price is false",
      "number.base":
        "price must be a number",
      "number.min":
        "price must be greater than or equal to 0",
    }),

  minimum_unit_price: Joi.number()
    .min(0)
    .when("is_callout_service", {
      is: true,
      then: Joi.forbidden(),
      otherwise: Joi.when("is_fixed_price", {
        is: true,
        then: Joi.forbidden(),
        otherwise: Joi.optional(),
      }),
    })
    .messages({
      "any.unknown":
        "minimum_unit_price is only allowed for unit-price services",
      "number.base":
        "minimum_unit_price must be a number",
      "number.min":
        "minimum_unit_price must be greater than or equal to 0",
    }),

  maximum_unit_price: Joi.number()
    .min(0)
    .when("is_callout_service", {
      is: true,
      then: Joi.forbidden(),
      otherwise: Joi.when("is_fixed_price", {
        is: true,
        then: Joi.forbidden(),
        otherwise: Joi.optional(),
      }),
    })
    .messages({
      "any.unknown":
        "maximum_unit_price is only allowed for unit-price services",
      "number.base":
        "maximum_unit_price must be a number",
      "number.min":
        "maximum_unit_price must be greater than or equal to 0",
    }),

  call_out_fee: Joi.number()
    .min(0)
    .when("is_callout_service", {
      is: false,
      then: Joi.forbidden(),
      otherwise: Joi.optional(),
    })
    .messages({
      "any.unknown":
        "call_out_fee is not allowed when is_callout_service is false",
      "number.base":
        "call_out_fee must be a number",
      "number.min":
        "call_out_fee must be greater than or equal to 0",
    }),

  estimated_time: Joi.number()
    .min(0)
    .optional()
    .messages({
      "number.base":
        "estimated_time must be a number",
      "number.min":
        "estimated_time must be greater than or equal to 0",
    }),

  estimated_time_unit: Joi.string()
    .valid(...Object.values(timeUnits))
    .optional()
    .messages({
      "any.only":
        "estimated_time_unit must be a valid time unit",
    }),

  is_active: Joi.boolean()
    .optional(),
})
  .custom((value, helpers) => {
    const {
      minimum_unit_price,
      maximum_unit_price,
    } = value;

    if (
      minimum_unit_price !== undefined &&
      maximum_unit_price !== undefined &&
      minimum_unit_price > maximum_unit_price
    ) {
      return helpers.error(
        "any.invalid",
        {
          message:
            "minimum_unit_price must be less than or equal to maximum_unit_price",
        }
      );
    }

    return value;
  })
  .messages({
    "any.invalid":
      "{{#message}}",
  });