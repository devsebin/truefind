import express from "express";
import validationMiddleware from "@/middlewares/request-validation.middleware";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";
import serviceCountryConfigurationsController from "./service-country-configurations.controller";
import {
  serviceCountryConfigCreateSchema,
  serviceCountryConfigUpdateSchema,
} from "./service-country-configurations.validator";

const router = express.Router();

router.get(
  "/",
  serviceCountryConfigurationsController.ListCountryConfig
);

router.post(
  "/",
  validationMiddleware(serviceCountryConfigCreateSchema),
  serviceCountryConfigurationsController.StoreCountryConfig
);

router.get(
  "/:id",
  paramsValidator,
  serviceCountryConfigurationsController.ShowCountryConfig
);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(serviceCountryConfigUpdateSchema),
  serviceCountryConfigurationsController.UpdateCountryConfig
);

router.delete(
  "/:id",
  paramsValidator,
  serviceCountryConfigurationsController.DeleteCountryConfig
);

export default router;
