import express from "express";
import validationMiddleware from "@/middlewares/request-validation.middleware";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";
import bundleCountryConfigurationsController from "./bundle-country-configurations.controller";
import {
  bundleCountryConfigCreateSchema,
  bundleCountryConfigUpdateSchema,
} from "./bundle-country-configurations.validator";

const router = express.Router();

router.get("/", bundleCountryConfigurationsController.ListCountryConfig);

router.post(
  "/",
  validationMiddleware(bundleCountryConfigCreateSchema),
  bundleCountryConfigurationsController.StoreCountryConfig,
);

router.get(
  "/:id",
  paramsValidator,
  bundleCountryConfigurationsController.ShowCountryConfig,
);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(bundleCountryConfigUpdateSchema),
  bundleCountryConfigurationsController.UpdateCountryConfig,
);

router.delete(
  "/:id",
  paramsValidator,
  bundleCountryConfigurationsController.DeleteCountryConfig,
);

export default router;
