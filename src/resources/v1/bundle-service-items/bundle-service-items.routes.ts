import express from "express";
import validationMiddleware from "@/middlewares/request-validation.middleware";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";
import bundleServiceItemsController from "./bundle-service-items.controller";
import {
  bundleServiceItemCreateSchema,
  bundleServiceItemUpdateSchema,
  bundleServiceItemToggleStatusSchema,
} from "./bundle-service-items.validator";

const router = express.Router();

router.get("/", bundleServiceItemsController.ListBundleServiceItem);

router.post(
  "/",
  validationMiddleware(bundleServiceItemCreateSchema),
  bundleServiceItemsController.StoreBundleServiceItem,
);

router.get(
  "/:id",
  paramsValidator,
  bundleServiceItemsController.ShowBundleServiceItem,
);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(bundleServiceItemUpdateSchema),
  bundleServiceItemsController.UpdateBundleServiceItem,
);

router.patch(
  "/:id/status",
  paramsValidator,
  validationMiddleware(bundleServiceItemToggleStatusSchema),
  bundleServiceItemsController.ToggleStatusBundleServiceItem,
);

router.delete(
  "/:id",
  paramsValidator,
  bundleServiceItemsController.DeleteBundleServiceItem,
);

export default router;
