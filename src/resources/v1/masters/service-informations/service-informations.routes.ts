import express from "express";
import validationMiddleware from "@/middlewares/request-validation.middleware";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";
import serviceInformationsController from "./service-informations.controller";
import {
  serviceInformationCreateSchema,
  serviceInformationUpdateSchema,
} from "./service-informations.validator";

const router = express.Router();

router.get(
  "/",
  serviceInformationsController.List,
);

router.post(
  "/",
  validationMiddleware(serviceInformationCreateSchema),
  serviceInformationsController.Store,
);

router.get(
  "/:id",
  paramsValidator,
  serviceInformationsController.Show,
);

router.put(
  "/:id",
  paramsValidator,
  validationMiddleware(serviceInformationUpdateSchema),
  serviceInformationsController.Update,
);

router.delete(
  "/:id",
  paramsValidator,
  serviceInformationsController.Delete,
);

router.patch(
  "/:id/enable",
  paramsValidator,
  serviceInformationsController.Enable,
);

router.patch(
  "/:id/disable",
  paramsValidator,
  serviceInformationsController.Disable,
);

export default router;
