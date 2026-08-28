import express from "express";
import bundlesController from "./bundles.controller";
import validationMiddleware, {
  validationSource,
} from "@/middlewares/request-validation.middleware";
import {
  bundlesInputValidator,
  updateBundlesInputValidator,
  deleteBundlesInputValidator,
} from "./bundles.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post(
  "/",
  validationMiddleware(bundlesInputValidator),
  bundlesController.Store,
);

router.get("/", bundlesController.Index);

router.get("/:id", paramsValidator, bundlesController.Show);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(updateBundlesInputValidator),
  bundlesController.Update,
);

router.delete(
  "/:id",
  paramsValidator,
  validationMiddleware(
    deleteBundlesInputValidator,
    validationSource.query,
  ),
  bundlesController.Delete,
);

router.patch("/:id/enable", paramsValidator, bundlesController.activate);
router.patch(
  "/:id/disable",
  paramsValidator,
  bundlesController.deactivate,
);
router.patch("/:id/approve", paramsValidator, bundlesController.Approve);

export default router;
