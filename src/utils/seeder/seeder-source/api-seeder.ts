import { api } from "../../../database/apis/apis-db-model";
import authenticationApiData from "../data-source/apis/authentication-api-data";
import statusesApiData from "../data-source/apis/statuses-apis";
import authenticationSessionsApiData from "../data-source/apis/authentication-sessions-api-data";
import userApiData from "../data-source/apis/user-api-data";
import countriesApiData from "../data-source/apis/countries-api-data";
import regionsApiData from "../data-source/apis/region-api-data";
import districtsApiData from "../data-source/apis/district-api-data";
import suburbsApiData from "../data-source/apis/suburb-api-data";
import providerApiData from "../data-source/apis/provider-api-data";
import documentApiData from "../data-source/apis/document-api-data";
import declaimerApiData from "../data-source/apis/declaimer-api-data";
import servicesApiData from "../data-source/apis/services-api-data";
import serviceCountryApiData from "../data-source/apis/service-country-api-data";
import serviceAreaApiData from "../data-source/apis/service-area-api-data";
import currenciesApiData from "../data-source/apis/currencies-api-data";
import prioritiesApiData from "../data-source/apis/priorities-api-data";
import unitsApiData from "../data-source/apis/units-api-data";
import rolesApiData from "../data-source/apis/roles-api-data";
import userWalletApiData from "../data-source/apis/user-wallet-api-data";
import serviceUserConfigurationApiData from "../data-source/apis/service-user-configuration-api-data";
import serviceDocumentApiData from "../data-source/apis/service-documents-api-data";
import serviceDocumentConfigurationApiData from "../data-source/apis/service-document-configuration-api-data";
import serviceUserDocumentConfigurationApiData from "../data-source/apis/service-user-document-configuration-api-data";
import documentTypesApiData from "../data-source/apis/document-types-api-data";
import carouselsApiData from "../data-source/apis/carousels-api-data";
import serviceInformationApiData from "../data-source/apis/service-information-api-data";
import serviceStatusesApiData from "../data-source/apis/service-statuses-api-data";
import bundleStatusesApiData from "../data-source/apis/bundle-statuses-api-data";
import bundleUserMappingStatusApiData from "../data-source/apis/bundle-user-mapping-status-api-data";
import bundleLocationConfigStatusesApiData from "../data-source/apis/bundle-location-config-statuses-api-data";
import bundleApiData from "../data-source/apis/bundle-api-data";
import RolesModel from "../../../database/roles/roles-db-model";
import { defaultRoles, seedRole } from "./role-seeder";

export const seedActivity = async () => {
  await seedRole();
  await api.deleteMany({});
  const roles = await RolesModel.find({});
  (global as any).rolesCookie = roles;

  const allApis = [
    ...authenticationApiData(),
    ...statusesApiData(),
    ...serviceStatusesApiData(),
    ...bundleStatusesApiData(),
    ...bundleUserMappingStatusApiData(),
    ...bundleLocationConfigStatusesApiData(),
    ...bundleApiData(),
    ...authenticationSessionsApiData(),
    ...userApiData(),
    ...countriesApiData(),
    ...regionsApiData(),
    ...districtsApiData(),
    ...suburbsApiData(),
    ...providerApiData(),
    ...documentApiData(),
    ...declaimerApiData(),
    ...servicesApiData(),
    ...serviceCountryApiData(),
    ...serviceAreaApiData(),
    ...currenciesApiData(),
    ...prioritiesApiData(),
    ...unitsApiData(),
    ...rolesApiData(),
    ...userWalletApiData(),
    ...serviceUserConfigurationApiData(),
    ...serviceUserDocumentConfigurationApiData(),
    ...serviceDocumentApiData(),
    ...serviceDocumentConfigurationApiData(),
    ...serviceInformationApiData(),
    ...documentTypesApiData(),
    ...carouselsApiData(),
  ];

  if (allApis.length > 0) {
    await api.insertMany(allApis);
  }
};
