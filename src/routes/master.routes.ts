import { Router } from "express";
import { authorizationApi } from "@/middlewares/authorization-api.middleware";
import authentication from "@/middlewares/authentication-validation.middleware";

import v1CountryRoutes from "../resources/v1/masters/countries/countries.routes";
import v1StatusRoutes from "../resources/v1/masters/statuses/statuses.routes";
import v1RegionRoutes from "../resources/v1/masters/regions/regions.routes"
const router = Router();

router.use("/statuses", authentication, authorizationApi, v1StatusRoutes);
router.use("/countries", authentication, authorizationApi, v1CountryRoutes);
router.use("/regions", authentication, authorizationApi, v1RegionRoutes);

export default router;