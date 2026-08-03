import express from "express";
import providersController from "./providers.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    providerInputValidator,
    updateProviderInputValidator,
    deleteProviderInputValidator,
    linkCountryParamsValidator,
    linkCountryBodyValidator,
    updateLinkCountryBodyValidator,
    testTypeParamsValidator,
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

router.post(
    "/:provider_id/link-countries/:country_id",
    validationMiddleware(linkCountryParamsValidator, validationSource.params),
    validationMiddleware(linkCountryBodyValidator, validationSource.body),
    providersController.linkCountry,
);

router.put(
    "/:provider_id/link-countries/:country_id",
    validationMiddleware(linkCountryParamsValidator, validationSource.params),
    validationMiddleware(updateLinkCountryBodyValidator, validationSource.body),
    providersController.updateLinkCountry,
);

router.post(
    "/:provider_id/link-countries/:country_id/types/:type_id/test",
    validationMiddleware(testTypeParamsValidator, validationSource.params),
    providersController.testType,
);

export default router;
