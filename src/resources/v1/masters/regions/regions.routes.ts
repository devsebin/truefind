import routes from "express";
import regionController from "./regions.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    regionInputValidator,
    updateRegionInputValidator,
    deleteRegionInputValidator,
} from "./regions.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = routes.Router();

router.post(
    "/",
    validationMiddleware(regionInputValidator),
    regionController.Store,
);

router.get("/", regionController.Index);

router.patch("/:id/enable", paramsValidator, regionController.activate);
router.patch("/:id/disable", paramsValidator, regionController.deactivate);

router.get("/:id", paramsValidator, regionController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(updateRegionInputValidator),
    regionController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deleteRegionInputValidator, validationSource.query),
    regionController.Delete,
);

export default router;
