import express from "express";
import serviceStatusesController from "./service-statuses.controller";
import validationMiddleware, {
  validationSource,
} from "@/middlewares/request-validation.middleware";
import {
  serviceStatusesInputValidator,
  updateServiceStatusesInputValidator,
  deleteServiceStatusesInputValidator,
} from "./service-statuses.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post(
  "/",
  validationMiddleware(serviceStatusesInputValidator),
  serviceStatusesController.Store,
);

router.get("/", serviceStatusesController.Index);

router.get("/:id", paramsValidator, serviceStatusesController.Show);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(updateServiceStatusesInputValidator),
  serviceStatusesController.Update,
);

router.delete(
  "/:id",
  paramsValidator,
  validationMiddleware(
    deleteServiceStatusesInputValidator,
    validationSource.query,
  ),
  serviceStatusesController.Delete,
);

router.patch("/:id/enable", paramsValidator, serviceStatusesController.activate);
router.patch(
  "/:id/disable",
  paramsValidator,
  serviceStatusesController.deactivate,
);

export default router;
