import validationMiddleware, {
  validationSource,
} from "@/middlewares/request-validation.middleware";
import express from "express";
import {
  categoryParamValidation,
  serviceCategoryValidationSchema,
  serviceSubCategoryValidationSchema,
  serviceTaskValidationSchema,
  serviceEntityUpdateValidator,
} from "./services.validator";
import servicesController from "./services.controller";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

/* Category routes */
router.post(
  "/category",
  validationMiddleware(serviceCategoryValidationSchema),
  servicesController.StoreCategory,
);

/* Subcategory routes */
router.post(
  "/sub-category",
  validationMiddleware(serviceSubCategoryValidationSchema),
  servicesController.StoreSubCategory,
);

/* Service/Task routes */
router.post(
  "/service",
  validationMiddleware(serviceTaskValidationSchema),
  servicesController.StoreService,
);

/* Common routes for Category, Subcategory, and Service */
router.get(
  "/",
  validationMiddleware(categoryParamValidation, validationSource.query),
  servicesController.ListCategory,
);

router.get(
  "/:id",
  paramsValidator,
  servicesController.ShowEntity,
);

router.put(
  "/:id",
  paramsValidator,
  serviceEntityUpdateValidator,
  servicesController.UpdateEntity,
);

router.delete(
  "/:id",
  paramsValidator,
  servicesController.DeleteEntity,
);

router.patch(
  "/:id/enable",
  paramsValidator,
  servicesController.EnableEntity,
);

router.patch(
  "/:id/disable",
  paramsValidator,
  servicesController.DisableEntity,
);

export default router;
