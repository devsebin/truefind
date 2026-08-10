import validationMiddleware from "@/middlewares/request-validation.middleware";
import express from "express";
import authenticationController from "./authentication.controller";
import { adminLoginValidation, refreshTokenValidation, sendOtpValidation } from "./authentication.validator";
import authenticate from "@/middlewares/authentication-validation.middleware";
const router = express.Router();


router.post("/login", validationMiddleware(adminLoginValidation), authenticationController.AdminLogin);

router.post(
    "/refresh-token",
    validationMiddleware(refreshTokenValidation),
    authenticationController.RefreshToken,
);

router.get("/logout", authenticate, authenticationController.Logout);

router.post("/logout-all", authenticate, authenticationController.LogoutAll);

router.post("/sent-otp", validationMiddleware(sendOtpValidation), authenticationController.SentOtp);



export default router;
