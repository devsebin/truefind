import express from "express";
import usersController from "./users.controller";
import validationMiddleware from "@/middlewares/request-validation.middleware";
import { userBasicValidation, userLocationValidation } from "./users.validator";
import { paramsValidator } from "@/middlewares/request-url-object-id.validation.middleware";

const router = express.Router();

router.post(
    "/basic",
    validationMiddleware(userBasicValidation),
    usersController.StoreBasicDetails,
);

router.get("/:id/services", usersController.ListServices)



router.get("/:id/user-location", paramsValidator,
    validationMiddleware(userLocationValidation),
    usersController.getUserLocation)

export default router;
