import { api } from "../../../database/apis/apis-db-model";
import authenticationApiData from "../data-source/apis/authentication-api-data";
import statusesApiData from "../data-source/apis/statuses-apis";
import authenticationSessionsApiData from "../data-source/apis/authentication-sessions-api-data";
import userApiData from "../data-source/apis/user-api-data";
import countriesApiData from "../data-source/apis/countries-api-data";

export const seedActivity = async () => {
  await api.deleteMany({});

  const allApis = [
    ...authenticationApiData,
    ...statusesApiData,
    ...authenticationSessionsApiData,
    ...userApiData,
    ...countriesApiData,
  ];

  if (allApis.length > 0) {
    await api.insertMany(allApis);
  }
};
