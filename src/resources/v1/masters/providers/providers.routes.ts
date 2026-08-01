import express from "express";
import providersController from "./providers.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    providerInputValidator,
    updateProviderInputValidator,
    deleteProviderInputValidator,
} from "./providers.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post("/",
    validationMiddleware(providerInputValidator),
    providersController.Store,
);

router.get("/", providersController.Index);

router.get("/:id", paramsValidator, providersController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(updateProviderInputValidator),
    providersController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deleteProviderInputValidator, validationSource.query),
    providersController.Delete,
);

router.patch("/:id/enable", paramsValidator, providersController.activate);
router.patch("/:id/disable", paramsValidator, providersController.deactivate);

export default router;
