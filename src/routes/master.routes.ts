import { Router } from "express";
import v1StatusRoutes from "../resources/v1/masters/statuses/statuses.routes";
import { authorizationApi } from "@/middlewares/authorization-api.middleware";
import authentication from "@/middlewares/authentication-validation.middleware";

const router = Router();

router.use("/statuses", authentication, authorizationApi, v1StatusRoutes);

export default router;