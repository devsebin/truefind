import { Router } from "express";
import authenticationRoutes from "@/resources/v1/authentication/authentication.routes";


const router = Router();
router.use("/authentication", authenticationRoutes);

export default router;