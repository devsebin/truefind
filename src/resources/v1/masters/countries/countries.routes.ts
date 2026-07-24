import express from "express";
import countryController from "./countries.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    countryInputValidator,
    updateCountryInputValidator,
    deleteCountryInputValidator,
} from "./countries.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post("/",
    validationMiddleware(countryInputValidator),
    countryController.Store,
);

router.get("/", countryController.Index);


router.get("/:id", paramsValidator, countryController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(updateCountryInputValidator),
    countryController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deleteCountryInputValidator, validationSource.query),
    countryController.Delete,
);

router.patch("/:id/enable", paramsValidator, countryController.activate);
router.patch("/:id/disable", paramsValidator, countryController.deactivate);

export default router;
