import routes from "express";
import suburbsController from "./suburbs.controller";
import validationMiddleware, {
    validationSource,
} from "@/middlewares/request-validation.middleware";
import {
    suburbInputValidator,
    updateSuburbInputValidator,
    deleteSuburbInputValidator,
} from "./suburbs.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = routes.Router();

router.post(
    "/",
    validationMiddleware(suburbInputValidator),
    suburbsController.Store,
);

router.get("/", suburbsController.Index);

router.patch("/:id/enable", paramsValidator, suburbsController.activate);
router.patch("/:id/disable", paramsValidator, suburbsController.deactivate);

router.get("/:id", paramsValidator, suburbsController.Show);

router.put(
    "/:id",
    paramsValidator,
    validationMiddleware(updateSuburbInputValidator),
    suburbsController.Update,
);

router.delete(
    "/:id",
    paramsValidator,
    validationMiddleware(deleteSuburbInputValidator, validationSource.query),
    suburbsController.Delete,
);

export default router;
