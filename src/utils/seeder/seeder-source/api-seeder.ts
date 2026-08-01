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
  ];

  if (allApis.length > 0) {
    await api.insertMany(allApis);
  }
};
