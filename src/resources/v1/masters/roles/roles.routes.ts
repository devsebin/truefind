import express from "express";
import rolesController from "./roles.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    rolesInputValidator,
    updateRolesInputValidator,
    deleteRolesInputValidator,
} from "./roles.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post("/",
    validationMiddleware(rolesInputValidator),
    rolesController.Store,
);

router.get("/", rolesController.Index);

router.get("/:id", paramsValidator, rolesController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(updateRolesInputValidator),
    rolesController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deleteRolesInputValidator, validationSource.query),
    rolesController.Delete,
);

router.patch("/:id/enable", paramsValidator, rolesController.activate);
router.patch("/:id/disable", paramsValidator, rolesController.deactivate);

export default router;
