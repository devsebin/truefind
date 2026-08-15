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
import RolesModel from "../../../database/roles/roles-db-model";
import { seedRole } from "./role-seeder";

export const seedActivity = async () => {
  await api.deleteMany({});

  const allApis = [
    ...authenticationApiData,
    ...statusesApiData,
    ...authenticationSessionsApiData,
    ...userApiData,
    ...countriesApiData,
    ...regionsApiData,
    ...districtsApiData,
    ...suburbsApiData,
    ...providerApiData,
    ...documentApiData,
    ...declaimerApiData,
    ...servicesApiData,
    ...serviceCountryApiData,
    ...serviceAreaApiData,
    ...currenciesApiData,
    ...prioritiesApiData,
    ...unitsApiData,
    ...rolesApiData,
  ];

  let roles = await RolesModel.find({});
  if (roles.length === 0) {
    await seedRole();
    roles = await RolesModel.find({});
  }

  const roleMap = new Map<string, any>();
  roles.forEach(r => roleMap.set(r.label, r._id));

  const mappedApis = allApis.map(apiData => {
    const resolvedRoles = (apiData.access_roles || []).map((label: string) => roleMap.get(label)).filter(Boolean);
    const { access_roles, ...rest } = apiData as any;
    return {
      ...rest,
      access_roles: resolvedRoles,
    };
  });

  if (mappedApis.length > 0) {
    await api.insertMany(mappedApis);
  }
};
