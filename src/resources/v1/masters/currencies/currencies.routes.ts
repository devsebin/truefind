import express from "express";
import currenciesController from "./currencies.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    currenciesValidationSchema,
    currenciesUpdateValidationSchema,
    deleteCurrencyInputValidator,
} from "./currencies.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post("/",
    validationMiddleware(currenciesValidationSchema),
    currenciesController.Store,
);

router.get("/", currenciesController.Index);

router.get("/:id", paramsValidator, currenciesController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(currenciesUpdateValidationSchema),
    currenciesController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deleteCurrencyInputValidator, validationSource.query),
    currenciesController.Delete,
);

router.patch("/:id/enable", paramsValidator, currenciesController.Enable);
router.patch("/:id/disable", paramsValidator, currenciesController.Disable);

export default router;
