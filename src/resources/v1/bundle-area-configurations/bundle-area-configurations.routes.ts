import express from "express";
import validationMiddleware from "@/middlewares/request-validation.middleware";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";
import bundleAreaConfigurationsController from "./bundle-area-configurations.controller";
import {
  bundleAreaConfigCreateSchema,
  bundleAreaConfigUpdateSchema,
} from "./bundle-area-configurations.validator";

const router = express.Router();

router.get("/", bundleAreaConfigurationsController.ListBundleAreaConfig);

router.post(
  "/",
  validationMiddleware(bundleAreaConfigCreateSchema),
  bundleAreaConfigurationsController.StoreBundleAreaConfig,
);

router.get(
  "/:id",
  paramsValidator,
  bundleAreaConfigurationsController.ShowBundleAreaConfig,
);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(bundleAreaConfigUpdateSchema),
  bundleAreaConfigurationsController.UpdateBundleAreaConfig,
);

router.patch(
  "/:id/enable",
  paramsValidator,
  bundleAreaConfigurationsController.EnableBundleAreaConfig,
);

router.patch(
  "/:id/disable",
  paramsValidator,
  bundleAreaConfigurationsController.DisableBundleAreaConfig,
);

export default router;
