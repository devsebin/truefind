import express from "express";
import serviceDocumentController from "./service-documents.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    serviceDocumentInputValidator,
    updateServiceDocumentInputValidator,
    deleteServiceDocumentInputValidator,
} from "./service-documents.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post(
    "/",
    validationMiddleware(serviceDocumentInputValidator),
    serviceDocumentController.Store,
);

router.get("/", serviceDocumentController.Index);

router.get("/:id", paramsValidator, serviceDocumentController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(updateServiceDocumentInputValidator),
    serviceDocumentController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deleteServiceDocumentInputValidator, validationSource.query),
    serviceDocumentController.Delete,
);

router.patch("/:id/enable", paramsValidator, serviceDocumentController.activate);
router.patch("/:id/disable", paramsValidator, serviceDocumentController.deactivate);

export default router;
