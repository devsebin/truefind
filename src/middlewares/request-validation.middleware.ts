import { Request, Response, NextFunction, RequestHandler } from "express";
import Joi from "joi";

export enum validationSource {
    body = "body",
    query = "query",
    params = "params",
}

function validationMiddleware(
    schema: Joi.Schema,
    source: validationSource = validationSource.body,
): RequestHandler {
    return async (
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
            const value = await schema.validateAsync(req[source], validationOptions);

            Object.defineProperty(req, source, {
                value,
                writable: true,
                configurable: true,
                enumerable: true,
            });

            next();
        } catch (e: any) {
            if (e.isJoi && Array.isArray(e.details)) {
                const errors: Record<string, string> = {};

                e.details.forEach((error: Joi.ValidationErrorItem) => {
                    const errorMessage = error.context?.message || error.message;

                    errors[error.context?.key || error.path.join(".")] = errorMessage;
                });

                res.status(400).json({ errors });
                return;
            }

            next(e);
        }
    };
}

export default validationMiddleware;
