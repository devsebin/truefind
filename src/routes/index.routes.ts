import { Router } from "express";
import authenticationRoutes from "@/resources/v1/authentication/authentication.routes";
import otpsRoutes from "@/resources/v1/otps/otps.routes";


const router = Router();
router.use("/authentication", authenticationRoutes);
router.use("/otps", otpsRoutes);

export default router;