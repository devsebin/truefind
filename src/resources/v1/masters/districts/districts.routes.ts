import routes from "express";
import districtsController from "./districts.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    districtInputValidator,
    updateDistrictInputValidator,
    deleteDistrictInputValidator,
} from "./districts.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = routes.Router();

router.post(
    "/",
    validationMiddleware(districtInputValidator),
    districtsController.Store,
);

router.get("/", districtsController.Index);

router.patch("/:id/enable", paramsValidator, districtsController.activate);
router.patch("/:id/disable", paramsValidator, districtsController.deactivate);

router.get("/:id", paramsValidator, districtsController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(updateDistrictInputValidator),
    districtsController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deleteDistrictInputValidator, validationSource.query),
    districtsController.Delete,
);

export default router;
