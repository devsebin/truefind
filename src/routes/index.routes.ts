import { Router } from "express";
import authenticationRoutes from "@/resources/v1/authentication/authentication.routes";
import otpsRoutes from "@/resources/v1/otps/otps.routes";
import userRoutes from "@/resources/v1/users/users.routes";
import authentication from "@/middlewares/authentication-validation.middleware";
import { authorizationApi } from "@/middlewares/authorization-api.middleware";

const router = Router();
router.use("/authentication", authenticationRoutes);
router.use("/otps", otpsRoutes);
router.use("/users", authentication, authorizationApi, userRoutes);

export default router;