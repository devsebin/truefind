import validationMiddleware from "@/middlewares/request-validation.middleware";
import express from "express";
import authenticationController from "./authentication.controller";
import { adminLoginValidation } from "./authentication.validator";
const router = express.Router();


router.post("/login", validationMiddleware(adminLoginValidation), authenticationController.AdminLogin);

export default router;
