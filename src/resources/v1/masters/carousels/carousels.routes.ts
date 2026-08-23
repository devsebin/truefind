import express from "express";
import carouselController from "./carousels.controller";
import validationMiddleware, {
  validationSource,
} from "@/middlewares/request-validation.middleware";
import {
  carouselInputValidator,
  updateCarouselInputValidator,
  deleteCarouselInputValidator,
} from "./carousels.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post(
  "/",
  validationMiddleware(carouselInputValidator),
  carouselController.Store,
);

router.get("/", carouselController.Index);

router.get("/:id", paramsValidator, carouselController.Show);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(updateCarouselInputValidator),
  carouselController.Update,
);

router.delete(
  "/:id",
  paramsValidator,
  validationMiddleware(deleteCarouselInputValidator, validationSource.query),
  carouselController.Delete,
);

router.patch("/:id/enable", paramsValidator, carouselController.activate);
router.patch("/:id/disable", paramsValidator, carouselController.deactivate);

export default router;
