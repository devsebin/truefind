import express from "express";
import bundleUserMappingStatusController from "./bundle-user-mapping-status.controller";
import validationMiddleware, {
  validationSource,
} from "@/middlewares/request-validation.middleware";
import {
  bundleUserMappingStatusInputValidator,
  updateBundleUserMappingStatusInputValidator,
  deleteBundleUserMappingStatusInputValidator,
} from "./bundle-user-mapping-status.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post(
  "/",
  validationMiddleware(bundleUserMappingStatusInputValidator),
  bundleUserMappingStatusController.Store,
);

router.get("/", bundleUserMappingStatusController.Index);

router.get("/:id", paramsValidator, bundleUserMappingStatusController.Show);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(updateBundleUserMappingStatusInputValidator),
  bundleUserMappingStatusController.Update,
);

router.delete(
  "/:id",
  paramsValidator,
  validationMiddleware(
    deleteBundleUserMappingStatusInputValidator,
    validationSource.query,
  ),
  bundleUserMappingStatusController.Delete,
);

router.patch("/:id/enable", paramsValidator, bundleUserMappingStatusController.activate);
router.patch(
  "/:id/disable",
  paramsValidator,
  bundleUserMappingStatusController.deactivate,
);

export default router;
