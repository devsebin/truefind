import fs from "fs";
import path from "path";

// Import all API seeder files
import authenticationApiData from "./src/utils/seeder/data-source/apis/authentication-api-data";
import statusesApiData from "./src/utils/seeder/data-source/apis/statuses-apis";
import authenticationSessionsApiData from "./src/utils/seeder/data-source/apis/authentication-sessions-api-data";
import userApiData from "./src/utils/seeder/data-source/apis/user-api-data";
import countriesApiData from "./src/utils/seeder/data-source/apis/countries-api-data";
import regionsApiData from "./src/utils/seeder/data-source/apis/region-api-data";
import districtsApiData from "./src/utils/seeder/data-source/apis/district-api-data";
import suburbsApiData from "./src/utils/seeder/data-source/apis/suburb-api-data";
import providerApiData from "./src/utils/seeder/data-source/apis/provider-api-data";
import documentApiData from "./src/utils/seeder/data-source/apis/document-api-data";
import declaimerApiData from "./src/utils/seeder/data-source/apis/declaimer-api-data";
import servicesApiData from "./src/utils/seeder/data-source/apis/services-api-data";
import serviceCountryApiData from "./src/utils/seeder/data-source/apis/service-country-api-data";
import serviceAreaApiData from "./src/utils/seeder/data-source/apis/service-area-api-data";
import currenciesApiData from "./src/utils/seeder/data-source/apis/currencies-api-data";
import prioritiesApiData from "./src/utils/seeder/data-source/apis/priorities-api-data";
import unitsApiData from "./src/utils/seeder/data-source/apis/units-api-data";
import rolesApiData from "./src/utils/seeder/data-source/apis/roles-api-data";
import userWalletApiData from "./src/utils/seeder/data-source/apis/user-wallet-api-data";
import serviceUserConfigurationApiData from "./src/utils/seeder/data-source/apis/service-user-configuration-api-data";
import serviceUserDocumentConfigurationApiData from "./src/utils/seeder/data-source/apis/service-user-document-configuration-api-data";
import serviceDocumentApiData from "./src/utils/seeder/data-source/apis/service-documents-api-data";
import serviceDocumentConfigurationApiData from "./src/utils/seeder/data-source/apis/service-document-configuration-api-data";
import documentTypesApiData from "./src/utils/seeder/data-source/apis/document-types-api-data";

(global as any).rolesCookie = [
  { _id: "64b8a1c8f1e67290bc5b4d1a", label: "super_admin" },
  { _id: "64b8a1c8f1e67290bc5b4d1b", label: "admin" },
  { _id: "64b8a1c8f1e67290bc5b4d1c", label: "employee" },
  { _id: "64b8a1c8f1e67290bc5b4d1d", label: "user" },
];

const modules = [
  { name: "Authentication", data: authenticationApiData() },
  { name: "Authentication Sessions", data: authenticationSessionsApiData() },
  { name: "Users", data: userApiData() },
  { name: "Statuses", data: statusesApiData() },
  { name: "Countries", data: countriesApiData() },
  { name: "Regions", data: regionsApiData() },
  { name: "Districts", data: districtsApiData() },
  { name: "Suburbs", data: suburbsApiData() },
  { name: "Providers", data: providerApiData() },
  { name: "Documents", data: documentApiData() },
  { name: "Declaimers", data: declaimerApiData() },
  { name: "Services", data: servicesApiData() },
  { name: "Service Country Configurations", data: serviceCountryApiData() },
  { name: "Service Area Configurations", data: serviceAreaApiData() },
  { name: "Currencies", data: currenciesApiData() },
  { name: "Priorities", data: prioritiesApiData() },
  { name: "Units", data: unitsApiData() },
  { name: "Roles", data: rolesApiData() },
  { name: "User Wallets & Webhooks", data: userWalletApiData() },
  { name: "Service User Configurations", data: serviceUserConfigurationApiData() },
  { name: "Service User Document Configurations", data: serviceUserDocumentConfigurationApiData() },
  { name: "Service Documents", data: serviceDocumentApiData() },
  { name: "Service Document Configurations", data: serviceDocumentConfigurationApiData() },
  { name: "Document Types", data: documentTypesApiData() },
];

function getSampleBodyForUrl(url: string, method: string): any {
  if (url === "/api/v1/authentication/sent-otp") {
    return { phone: "+919876543210" };
  }
  if (url.includes("/api/v1/authentication/verify-otp")) {
    return { otp: "123456" };
  }
  if (url === "/api/v1/authentication/refresh-token") {
    return { refresh_token: "string" };
  }
  if (url === "/api/v1/service-user-configurations" && method === "POST") {
    return { service_ids: ["64b8a1c8f1e67290bc5b4d1a"] };
  }
  if (url === "/api/v1/service-user-configurations/single" && method === "POST") {
    return { service_id: "64b8a1c8f1e67290bc5b4d1a" };
  }
  if (url.endsWith("/upload") && method === "POST") {
    return { document_id: "64b8a1c8f1e67290bc5b4d1a" };
  }
  if (url.endsWith("/approve") && method === "PATCH") {
    return { validation_notes: "Documents verified and approved." };
  }
  if (url.endsWith("/reject") && method === "PATCH") {
    return { reason: "Document is blurry or illegible." };
  }
  return null;
}

function buildPostmanItem(api: any) {
  const method = (api.activity_method || "GET").toUpperCase();
  const rawUrlClean = api.url.replace(/^\//, "");
  const urlSegments = rawUrlClean.split("/");

  const queryParams = (api.search_params || []).map((sp: any) => ({
    key: sp.value || sp.title,
    value: "",
    description: sp.title || "",
    disabled: true,
  }));

  const pathVariables = urlSegments
    .filter((p: string) => p.startsWith(":"))
    .map((p: string) => ({
      key: p.replace(":", ""),
      value: "",
      description: "Target ID or parameter",
    }));

  const item: any = {
    name: api.activity_name || api.activity_code || api.url,
    request: {
      method: method,
      header: [
        {
          key: "Content-Type",
          value: "application/json",
          type: "text",
        },
      ],
      url: {
        raw: "{{base_url}}" + api.url,
        host: ["{{base_url}}"],
        path: urlSegments,
        query: queryParams.length > 0 ? queryParams : undefined,
        variable: pathVariables.length > 0 ? pathVariables : undefined,
      },
      description: [
        `**Activity Code**: \`${api.activity_code}\``,
        `**Module**: \`${api.module}\``,
        `**Auth Required**: \`${api.required_authentication}\``,
      ].join("\n\n"),
    },
    response: [],
  };

  if (api.required_authentication !== false) {
    item.request.auth = {
      type: "bearer",
      bearer: [
        {
          key: "token",
          value: "{{auth_token}}",
          type: "string",
        },
      ],
    };
  }

  const sampleCustomBody = getSampleBodyForUrl(api.url, method);
  if (sampleCustomBody) {
    item.request.body = {
      mode: "raw",
      raw: JSON.stringify(sampleCustomBody, null, 2),
      options: {
        raw: {
          language: "json",
        },
      },
    };
  } else if (["POST", "PUT", "PATCH"].includes(method)) {
    const sampleBody: Record<string, any> = {};
    if (api.form_params && api.form_params.length > 0) {
      api.form_params.forEach((fp: any) => {
        sampleBody[fp.field_name || fp.name] = fp.sample_value || "";
      });
    }
    if (Object.keys(sampleBody).length > 0) {
      item.request.body = {
        mode: "raw",
        raw: JSON.stringify(sampleBody, null, 2),
        options: {
          raw: {
            language: "json",
          },
        },
      };
    }
  }

  return item;
}

const collection = {
  info: {
    _postman_id: "trufindo-api-collection-v1",
    name: "Trufindo API Collection (v1)",
    description:
      "Complete Postman collection for all Trufindo v1 APIs, Business Operations, and Masters.",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
  },
  variable: [
    {
      key: "base_url",
      value: "http://localhost:3000",
      type: "string",
    },
    {
      key: "auth_token",
      value: "",
      type: "string",
    },
  ],
  item: modules.map((m) => ({
    name: m.name,
    item: m.data.map((api: any) => buildPostmanItem(api)),
  })),
};

const outputPath = path.join(process.cwd(), "postman_collection.json");
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), "utf-8");
console.log("Postman collection generated at:", outputPath);
