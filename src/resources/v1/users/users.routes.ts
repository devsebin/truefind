import express from "express";
import usersController from "./users.controller";
import validationMiddleware from "@/middlewares/request-validation.middleware";
import { userBasicValidation } from "./users.validator";

const router = express.Router();

router.post(
    "/basic",
    validationMiddleware(userBasicValidation),
    usersController.StoreBasicDetails,
);

export default router;
