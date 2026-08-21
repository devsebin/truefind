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
import v1RolesRoutes from "../resources/v1/masters/roles/roles.routes";
import v1ServiceDocumentRoutes from "../resources/v1/masters/service-documents/service-documents.routes";
import v1DocumentTypesRoutes from "../resources/v1/masters/document-types/document-types.routes";
import { getLocationFromCoordinates } from "@/utils/helpers/location.helper";

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
router.use("/service-documents", authentication, authorizationApi, v1ServiceDocumentRoutes);
router.use("/document-types", authentication, authorizationApi, v1DocumentTypesRoutes);
router.use("/priorities", authentication, authorizationApi, v1PrioritiesRoutes);
router.use("/units", authentication, authorizationApi, v1UnitsRoutes);
router.use("/currencies", authentication, authorizationApi, v1CurrenciesRoutes);
router.use("/roles", authentication, authorizationApi, v1RolesRoutes);

router.use('/test', async (req, res, next) => {
    try {


        const location = await getLocationFromCoordinates(-36.986096712299435, 174.8934903934306);
        // const location = await getLocationFromCoordinates(9.9406, 76.2653);

        //         {
        //   country: 'India',
        //   countryCode: 'IN',
        //   region: 'Kerala',
        //   regionCode: 'KL',
        //   district: null,
        //   city: 'Kochi',
        //   formattedAddress: 'W7R8+64 Kochi, Kerala, India'
        // }
        console.log(location);
        res.status(200).json({
            message: "Success",
            status: 200,
            success: true,
            code: 200,
        })
    } catch (error) {
        next(error)
    }
})

export default router;