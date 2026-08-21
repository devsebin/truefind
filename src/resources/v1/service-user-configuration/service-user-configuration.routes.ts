import express from "express";
import serviceUserConfigurationController from "./service-user-configuration.controller";
import validationMiddleware, {
  validationSource,
} from "@/middlewares/request-validation.middleware";
import {
  bulkStoreServiceUserConfigValidator,
  singleServiceUserConfigValidator,
  deleteServiceUserConfigValidator,
} from "./service-user-configuration.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post(
  "/",
  validationMiddleware(bulkStoreServiceUserConfigValidator),
  serviceUserConfigurationController.BulkStore,
);

router.post(
  "/single",
  validationMiddleware(singleServiceUserConfigValidator),
  serviceUserConfigurationController.StoreSingle,
);

router.get("/", serviceUserConfigurationController.Index);

router.patch(
  "/:id/enable",
  paramsValidator,
  serviceUserConfigurationController.activate,
);

router.patch(
  "/:id/disable",
  paramsValidator,
  serviceUserConfigurationController.deactivate,
);

router.get(
  "/:id",
  paramsValidator,
  serviceUserConfigurationController.Show,
);

router.delete(
  "/:id",
  paramsValidator,
  validationMiddleware(
    deleteServiceUserConfigValidator,
    validationSource.query,
  ),
  serviceUserConfigurationController.Delete,
);

export default router;
