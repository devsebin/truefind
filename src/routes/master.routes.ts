import { Router } from "express";
import { authorizationApi } from "@/middlewares/authorization-api.middleware";
import authentication from "@/middlewares/authentication-validation.middleware";

import v1CountryRoutes from "../resources/v1/masters/countries/countries.routes";
import v1StatusRoutes from "../resources/v1/masters/statuses/statuses.routes";
import v1RegionRoutes from "../resources/v1/masters/regions/regions.routes"
import v1DistrictRoutes from "../resources/v1/masters/districts/districts.routes";
import v1SuburbRoutes from "../resources/v1/masters/suburbs/suburbs.routes";
import v1ProviderRoutes from "../resources/v1/masters/providers/providers.routes";
const router = Router();

router.use("/statuses", authentication, authorizationApi, v1StatusRoutes);
router.use("/countries", authentication, authorizationApi, v1CountryRoutes);
router.use("/regions", authentication, authorizationApi, v1RegionRoutes);
router.use("/districts", authentication, authorizationApi, v1DistrictRoutes);
router.use("/suburbs", authentication, authorizationApi, v1SuburbRoutes);
router.use("/providers", authentication, authorizationApi, v1ProviderRoutes);

export default router;