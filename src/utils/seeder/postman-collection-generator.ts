import "module-alias/register";
import fs from "fs";
import path from "path";

// Import all API seeder files
import authenticationApiData from "@/utils/seeder/data-source/apis/authentication-api-data";
import statusesApiData from "@/utils/seeder/data-source/apis/statuses-apis";
import authenticationSessionsApiData from "@/utils/seeder/data-source/apis/authentication-sessions-api-data";
import userApiData from "@/utils/seeder/data-source/apis/user-api-data";
import countriesApiData from "@/utils/seeder/data-source/apis/countries-api-data";
import regionsApiData from "@/utils/seeder/data-source/apis/region-api-data";
import districtsApiData from "@/utils/seeder/data-source/apis/district-api-data";
import suburbsApiData from "@/utils/seeder/data-source/apis/suburb-api-data";
import providerApiData from "@/utils/seeder/data-source/apis/provider-api-data";
import documentApiData from "@/utils/seeder/data-source/apis/document-api-data";
import declaimerApiData from "@/utils/seeder/data-source/apis/declaimer-api-data";
import servicesApiData from "@/utils/seeder/data-source/apis/services-api-data";
import serviceCountryApiData from "@/utils/seeder/data-source/apis/service-country-api-data";
import serviceAreaApiData from "@/utils/seeder/data-source/apis/service-area-api-data";
import currenciesApiData from "@/utils/seeder/data-source/apis/currencies-api-data";
import prioritiesApiData from "@/utils/seeder/data-source/apis/priorities-api-data";
import unitsApiData from "@/utils/seeder/data-source/apis/units-api-data";
import rolesApiData from "@/utils/seeder/data-source/apis/roles-api-data";
import userWalletApiData from "@/utils/seeder/data-source/apis/user-wallet-api-data";
import serviceUserConfigurationApiData from "@/utils/seeder/data-source/apis/service-user-configuration-api-data";
import serviceUserDocumentConfigurationApiData from "@/utils/seeder/data-source/apis/service-user-document-configuration-api-data";
import serviceDocumentApiData from "@/utils/seeder/data-source/apis/service-documents-api-data";
import serviceDocumentConfigurationApiData from "@/utils/seeder/data-source/apis/service-document-configuration-api-data";
import documentTypesApiData from "@/utils/seeder/data-source/apis/document-types-api-data";
import carouselsApiData from "@/utils/seeder/data-source/apis/carousels-api-data";
import serviceInformationApiData from "@/utils/seeder/data-source/apis/service-information-api-data";
import serviceStatusesApiData from "@/utils/seeder/data-source/apis/service-statuses-api-data";
import bundleStatusesApiData from "@/utils/seeder/data-source/apis/bundle-statuses-api-data";
import bundleUserMappingStatusApiData from "@/utils/seeder/data-source/apis/bundle-user-mapping-status-api-data";
import bundleLocationConfigStatusesApiData from "@/utils/seeder/data-source/apis/bundle-location-config-statuses-api-data";
import bundleCountryApiData from "@/utils/seeder/data-source/apis/bundle-country-api-data";
import bundleApiData from "@/utils/seeder/data-source/apis/bundle-api-data";
export const generatePostmanCollection = () => {
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
    { name: "Service Statuses", data: serviceStatusesApiData() },
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
    { name: "Service Information", data: serviceInformationApiData() },
    { name: "Document Types", data: documentTypesApiData() },
    { name: "Carousels", data: carouselsApiData() },
    { name: "Bundle Statuses", data: bundleStatusesApiData() },
    { name: "Bundle User Mapping Statuses", data: bundleUserMappingStatusApiData() },
    { name: "Bundle Location Config Statuses", data: bundleLocationConfigStatusesApiData() },
    { name: "Bundle Country Configurations", data: bundleCountryApiData() },
    { name: "Bundles", data: bundleApiData() },
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
      key: sp.title || sp.value,
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

      if (api.payload_params && api.payload_params.length > 0) {
        api.payload_params.forEach((pp: any) => {
          let val: any = pp.value;
          if (val === "string") val = pp.key;
          else if (val === "number") val = 1;
          else if (val === "boolean") val = true;
          else if (val === "array") val = [];
          else if (val === "object") val = {};
          else if (val === undefined || val === null) val = "";
          sampleBody[pp.key] = val;
        });
      } else if (api.form_params && api.form_params.length > 0) {
        api.form_params.forEach((fp: any) => {
          sampleBody[fp.field_name || fp.key || fp.name] = fp.sample_value || "";
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
        value: "{{token}}",
        type: "string",
      },
    ],
    item: modules.map((m) => ({
      name: m.name,
      item: m.data.map((api: any) => buildPostmanItem(api)),
    })),
  };

  const outputPath = path.join(process.cwd(), "trufindo_postman_collection.json");
  fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2), "utf-8");
  console.log("Postman collection successfully generated at:", outputPath);
};

generatePostmanCollection();
