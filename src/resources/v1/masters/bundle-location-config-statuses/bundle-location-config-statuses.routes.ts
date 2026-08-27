import express from "express";
import bundleLocationConfigStatusesController from "./bundle-location-config-statuses.controller";
import validationMiddleware, {
  validationSource,
} from "@/middlewares/request-validation.middleware";
import {
  bundleLocationConfigStatusesInputValidator,
  updateBundleLocationConfigStatusesInputValidator,
  deleteBundleLocationConfigStatusesInputValidator,
} from "./bundle-location-config-statuses.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post(
  "/",
  validationMiddleware(bundleLocationConfigStatusesInputValidator),
  bundleLocationConfigStatusesController.Store,
);

router.get("/", bundleLocationConfigStatusesController.Index);

router.get("/:id", paramsValidator, bundleLocationConfigStatusesController.Show);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(updateBundleLocationConfigStatusesInputValidator),
  bundleLocationConfigStatusesController.Update,
);

router.delete(
  "/:id",
  paramsValidator,
  validationMiddleware(
    deleteBundleLocationConfigStatusesInputValidator,
    validationSource.query,
  ),
  bundleLocationConfigStatusesController.Delete,
);

router.patch(
  "/:id/enable",
  paramsValidator,
  bundleLocationConfigStatusesController.activate,
);
router.patch(
  "/:id/disable",
  paramsValidator,
  bundleLocationConfigStatusesController.deactivate,
);

export default router;
