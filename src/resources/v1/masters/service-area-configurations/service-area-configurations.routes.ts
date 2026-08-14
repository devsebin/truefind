import express from "express";
import validationMiddleware from "@/middlewares/request-validation.middleware";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";
import serviceAreaConfigurationsController from "./service-area-configurations.controller";
import {
  serviceAreaBulkOverrideSchema,
} from "./service-area-configurations.validator";

const router = express.Router();

router.get(
  "/available",
  serviceAreaConfigurationsController.ListAvailableServices
);

router.post(
  "/:serviceId",
  paramsValidator,
  validationMiddleware(serviceAreaBulkOverrideSchema),
  serviceAreaConfigurationsController.BulkCreateAreaOverride
);

router.get(
  "/:serviceId/effective",
  paramsValidator,
  serviceAreaConfigurationsController.ShowEffectiveConfig
);

export default router;
