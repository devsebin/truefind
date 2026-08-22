import { Router } from "express";
import authenticationRoutes from "@/resources/v1/authentication/authentication.routes";
import otpsRoutes from "@/resources/v1/otps/otps.routes";
import userRoutes from "@/resources/v1/users/users.routes";
import userWalletsRoutes from "@/resources/v1/user-wallets/user-wallets.routes";
import webhookRoutes from "@/resources/v1/user-wallets/webhook.routes";
import serviceUserConfigurationRoutes from "@/resources/v1/service-user-configuration/service-user-configuration.routes";
import serviceUserDocumentConfigurationRoutes from "@/resources/v1/service-user-document-configuration/service-user-document-configuration.routes";
import authentication from "@/middlewares/authentication-validation.middleware";
import { authorizationApi } from "@/middlewares/authorization-api.middleware";

const router = Router();
router.use("/authentication", authenticationRoutes);
router.use("/otps", otpsRoutes);
router.use("/users", authentication, authorizationApi, userRoutes);
router.use("/wallets", authentication, authorizationApi, userWalletsRoutes);
router.use("/service-user-configurations", authentication, authorizationApi, serviceUserConfigurationRoutes);
router.use("/service-user-document-configurations", authentication, authorizationApi, serviceUserDocumentConfigurationRoutes);
router.use("/webhooks", webhookRoutes);

export default router;
