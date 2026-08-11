import express from "express";
import declaimersController from "./declaimers.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    declaimerInputValidator,
    updateDeclaimerInputValidator,
    deleteDeclaimerInputValidator,
} from "./declaimers.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post("/",
    validationMiddleware(declaimerInputValidator),
    declaimersController.Store,
);

router.get("/", declaimersController.Index);

router.get("/:id", paramsValidator, declaimersController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(updateDeclaimerInputValidator),
    declaimersController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deleteDeclaimerInputValidator, validationSource.query),
    declaimersController.Delete,
);

router.patch("/:id/enable", paramsValidator, declaimersController.activate);
router.patch("/:id/disable", paramsValidator, declaimersController.deactivate);

export default router;
