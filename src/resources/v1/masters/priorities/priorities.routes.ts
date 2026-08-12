import express from "express";
import prioritiesController from "./priorities.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    prioritiesInputValidator,
    updatePrioritiesInputValidator,
    deletePrioritiesInputValidator,
} from "./priorities.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post("/",
    validationMiddleware(prioritiesInputValidator),
    prioritiesController.Store,
);

router.get("/", prioritiesController.Index);

router.get("/:id", paramsValidator, prioritiesController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(updatePrioritiesInputValidator),
    prioritiesController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deletePrioritiesInputValidator, validationSource.query),
    prioritiesController.Delete,
);

router.patch("/:id/enable", paramsValidator, prioritiesController.activate);
router.patch("/:id/disable", paramsValidator, prioritiesController.deactivate);

export default router;
