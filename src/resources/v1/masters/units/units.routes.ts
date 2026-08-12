import express from "express";
import unitsController from "./units.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    unitsInputValidator,
    updateUnitsInputValidator,
    deleteUnitsInputValidator,
} from "./units.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post("/",
    validationMiddleware(unitsInputValidator),
    unitsController.Store,
);

router.get("/", unitsController.Index);

router.get("/:id", paramsValidator, unitsController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(updateUnitsInputValidator),
    unitsController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deleteUnitsInputValidator, validationSource.query),
    unitsController.Delete,
);

router.patch("/:id/enable", paramsValidator, unitsController.activate);
router.patch("/:id/disable", paramsValidator, unitsController.deactivate);

export default router;
