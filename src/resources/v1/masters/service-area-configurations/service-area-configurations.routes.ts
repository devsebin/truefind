import express from "express";
import validationMiddleware from "@/middlewares/request-validation.middleware";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";
import serviceAreaConfigurationsController from "./service-area-configurations.controller";
import {
  serviceAreaBulkOverrideSchema,
  serviceAreaConfigUpdateSchema,
} from "./service-area-configurations.validator";

const router = express.Router();

router.get(
  "/available",
  serviceAreaConfigurationsController.ListAvailableServices
);

router.post(
  "/:id",
  paramsValidator,
  validationMiddleware(serviceAreaBulkOverrideSchema),
  serviceAreaConfigurationsController.BulkCreateAreaOverride
);

router.get(
  "/:id/effective",
  paramsValidator,
  serviceAreaConfigurationsController.ShowEffectiveConfig
);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(serviceAreaConfigUpdateSchema),
  serviceAreaConfigurationsController.Update
);

router.patch(
  "/:id/enable",
  paramsValidator,
  serviceAreaConfigurationsController.Activate
);

router.patch(
  "/:id/disable",
  paramsValidator,
  serviceAreaConfigurationsController.Deactivate
);

export default router;
