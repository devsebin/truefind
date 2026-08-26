import express from "express";
import bundleStatusesController from "./bundle-statuses.controller";
import validationMiddleware, {
  validationSource,
} from "@/middlewares/request-validation.middleware";
import {
  bundleStatusesInputValidator,
  updateBundleStatusesInputValidator,
  deleteBundleStatusesInputValidator,
} from "./bundle-statuses.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post(
  "/",
  validationMiddleware(bundleStatusesInputValidator),
  bundleStatusesController.Store,
);

router.get("/", bundleStatusesController.Index);

router.get("/:id", paramsValidator, bundleStatusesController.Show);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(updateBundleStatusesInputValidator),
  bundleStatusesController.Update,
);

router.delete(
  "/:id",
  paramsValidator,
  validationMiddleware(
    deleteBundleStatusesInputValidator,
    validationSource.query,
  ),
  bundleStatusesController.Delete,
);

router.patch("/:id/enable", paramsValidator, bundleStatusesController.activate);
router.patch(
  "/:id/disable",
  paramsValidator,
  bundleStatusesController.deactivate,
);

export default router;
