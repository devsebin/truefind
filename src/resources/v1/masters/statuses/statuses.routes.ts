import routes from "express";
import statusController from "./statuses.controller";
import validationMiddleware, {
  validationSource,
} from "@/middlewares/request-validation.middleware";
import {
  deleteStatusInputValidator,
  statusInputValidator,
  updateStatusInputValidator,
} from "./statuses.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";
const router = routes.Router();
router.post(
  "/",
  validationMiddleware(statusInputValidator),
  statusController.Store,
);
router.get("/", statusController.Index);
router.patch("/:id/enable", paramsValidator, statusController.activate);
router.patch("/:id/disable", paramsValidator, statusController.deactivate);
router.get("/:id", statusController.Show);
router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(updateStatusInputValidator),
  statusController.Update,
);
router.delete(
  "/:id",
  paramsValidator,
  validationMiddleware(deleteStatusInputValidator, validationSource.query),
  statusController.Delete,
);
export default router;
