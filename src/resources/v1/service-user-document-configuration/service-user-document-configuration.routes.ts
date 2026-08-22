import express from "express";
import serviceUserDocumentConfigurationController from "./service-user-document-configuration.controller";
import validationMiddleware, {
  validationSource,
} from "@/middlewares/request-validation.middleware";
import { deleteServiceUserDocConfigValidator } from "./service-user-document-configuration.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.get("/", serviceUserDocumentConfigurationController.Index);

router.patch(
  "/:id/enable",
  paramsValidator,
  serviceUserDocumentConfigurationController.activate,
);

router.patch(
  "/:id/disable",
  paramsValidator,
  serviceUserDocumentConfigurationController.deactivate,
);

router.get(
  "/:id",
  paramsValidator,
  serviceUserDocumentConfigurationController.Show,
);

router.delete(
  "/:id",
  paramsValidator,
  validationMiddleware(
    deleteServiceUserDocConfigValidator,
    validationSource.query,
  ),
  serviceUserDocumentConfigurationController.Delete,
);

export default router;
