import { Request, Response, NextFunction, RequestHandler } from "express";
import Joi from "joi";
import mongoose from "mongoose";

export const RequestValidation = (schema: Joi.Schema): RequestHandler => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };

    try {
      const value = await schema.validateAsync(req.body, validationOptions);
      req.body = value;
      next();
    } catch (e: any) {
      const errors: string[] = [];
      e.details.forEach((error: Joi.ValidationErrorItem) => {
        errors.push(error.message);
      });
      res.status(400).send({ errors: errors });
    }
  };
};

export const validateObjectIds = (ids: Record<string, any>): string | null => {
  for (const [key, value] of Object.entries(ids)) {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return key + " -> " + value;
    }
  }
  return null;
};
