import express from "express";
import documentTypesController from "./document-types.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    documentTypesInputValidator,
    updateDocumentTypesInputValidator,
    deleteDocumentTypesInputValidator,
} from "./document-types.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post("/",
    validationMiddleware(documentTypesInputValidator),
    documentTypesController.Store,
);

router.get("/", documentTypesController.Index);

router.get("/:id", paramsValidator, documentTypesController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(updateDocumentTypesInputValidator),
    documentTypesController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deleteDocumentTypesInputValidator, validationSource.query),
    documentTypesController.Delete,
);

router.patch("/:id/enable", paramsValidator, documentTypesController.activate);
router.patch("/:id/disable", paramsValidator, documentTypesController.deactivate);

export default router;
