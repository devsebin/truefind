import express from "express";
import validationMiddleware from "@/middlewares/request-validation.middleware";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";
import serviceDocumentConfigurationsController from "./service-document-configurations.controller";
import {
  serviceDocumentConfigCreateSchema,
  serviceDocumentConfigUpdateSchema,
} from "./service-document-configurations.validator";

const router = express.Router();

router.get(
  "/",
  serviceDocumentConfigurationsController.List,
);

router.post(
  "/",
  validationMiddleware(serviceDocumentConfigCreateSchema),
  serviceDocumentConfigurationsController.Store,
);

router.get(
  "/:id",
  paramsValidator,
  serviceDocumentConfigurationsController.Show,
);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(serviceDocumentConfigUpdateSchema),
  serviceDocumentConfigurationsController.Update,
);

router.delete(
  "/:id",
  paramsValidator,
  serviceDocumentConfigurationsController.Delete,
);

router.patch(
  "/:id/enable",
  paramsValidator,
  serviceDocumentConfigurationsController.Enable,
);

router.patch(
  "/:id/disable",
  paramsValidator,
  serviceDocumentConfigurationsController.Disable,
);

export default router;
