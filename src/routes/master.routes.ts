import { Router } from "express";
import { authorizationApi } from "@/middlewares/authorization-api.middleware";
import authentication from "@/middlewares/authentication-validation.middleware";

import v1CountryRoutes from "../resources/v1/masters/countries/countries.routes";
import v1StatusRoutes from "../resources/v1/masters/statuses/statuses.routes";
import v1RegionRoutes from "../resources/v1/masters/regions/regions.routes"
import v1DistrictRoutes from "../resources/v1/masters/districts/districts.routes";
import v1SuburbRoutes from "../resources/v1/masters/suburbs/suburbs.routes";
import v1ProviderRoutes from "../resources/v1/masters/providers/providers.routes";
import v1DocumentRoutes from "../resources/v1/masters/documents/documents.routes"
import v1DeclaimerRoutes from "../resources/v1/masters/declaimers/declaimers.routes";
import v1AuthSessionRoutes from "../resources/v1/auth-sessions/auth-sessions.routes";
import v1ServiceRoutes from "../resources/v1/masters/services/services.routes";
import v1ServiceCountryConfigRoutes from "../resources/v1/masters/service-country-configurations/service-country-configurations.routes";
import v1ServiceAreaConfigRoutes from "../resources/v1/masters/service-area-configurations/service-area-configurations.routes";
import v1PrioritiesRoutes from "../resources/v1/masters/priorities/priorities.routes";
import v1UnitsRoutes from "../resources/v1/masters/units/units.routes";
import v1CurrenciesRoutes from "../resources/v1/masters/currencies/currencies.routes";

const router = Router();

router.use("/statuses", authentication, authorizationApi, v1StatusRoutes);
router.use("/countries", authentication, authorizationApi, v1CountryRoutes);
router.use("/regions", authentication, authorizationApi, v1RegionRoutes);
router.use("/districts", authentication, authorizationApi, v1DistrictRoutes);
router.use("/suburbs", authentication, authorizationApi, v1SuburbRoutes);
router.use("/providers", authentication, authorizationApi, v1ProviderRoutes);
router.use("/documents", authentication, authorizationApi, v1DocumentRoutes);
router.use("/declaimers", authentication, authorizationApi, v1DeclaimerRoutes);
router.use("/auth-sessions", authentication, authorizationApi, v1AuthSessionRoutes);
router.use("/services", authentication, authorizationApi, v1ServiceRoutes);
router.use("/service-country-configurations", authentication, authorizationApi, v1ServiceCountryConfigRoutes);
router.use("/service-area-configurations", authentication, authorizationApi, v1ServiceAreaConfigRoutes);
router.use("/priorities", authentication, authorizationApi, v1PrioritiesRoutes);
router.use("/units", authentication, authorizationApi, v1UnitsRoutes);
router.use("/currencies", authentication, authorizationApi, v1CurrenciesRoutes);

export default router;