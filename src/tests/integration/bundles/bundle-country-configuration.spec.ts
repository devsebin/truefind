import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { requestContext } from "@/utils/context/request-context";
import BundleModel from "@/database/bundles/bundles-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import CountryModel from "@/database/countries/countries-db-model";
import CurrencyModel from "@/database/currencies/currencies-db-model";
import BundleCountryConfigurationModel from "@/database/bundle-country-configuration/bundle-country-configuration-db-model";
import BundleLocationConfigStatusesModel from "@/database/bundle-location-config-status/bundle-location-config-status-db-model";
import UnitsModel from "@/database/units/units-db-model";

import createBundleCountryConfigurationService from "@/resources/v1/bundle-country-configurations/services/create-bundle-country-configuration.service";
import listBundleCountryConfigurationService from "@/resources/v1/bundle-country-configurations/services/list-bundle-country-configuration.service";
import showBundleCountryConfigurationService from "@/resources/v1/bundle-country-configurations/services/show-bundle-country-configuration.service";
import updateBundleCountryConfigurationService from "@/resources/v1/bundle-country-configurations/services/update-bundle-country-configuration.service";
import deleteBundleCountryConfigurationService from "@/resources/v1/bundle-country-configurations/services/delete-bundle-country-configuration.service";
import { timeUnits } from "@/database/services/services-db-interface";

describe("Bundle Country Configuration Service (Integration)", () => {
  let testUser: any;
  let testIcon: any;
  let testUnit: any;
  let activeStatus: any;
  let bundleLocationStatus: any;
  let indiaCountry: any;
  let inrCurrency: any;
  let homeCleaningBundle: any;

  beforeAll(async () => {
    await BundleModel.ensureIndexes();
    await DocumentModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await CurrencyModel.ensureIndexes();
    await BundleCountryConfigurationModel.ensureIndexes();
    await BundleLocationConfigStatusesModel.ensureIndexes();
    await UnitsModel.ensureIndexes();
  });

  beforeEach(async () => {
    await BundleCountryConfigurationModel.deleteMany({});
    await BundleLocationConfigStatusesModel.deleteMany({});
    await UnitsModel.deleteMany({});
    await CurrencyModel.deleteMany({});
    await CountryModel.deleteMany({});
    await BundleModel.deleteMany({});
    await UserModel.deleteMany({});
    await DocumentModel.deleteMany({});
    await StatusModel.deleteMany({});
    await PriorityModel.deleteMany({});

    activeStatus = await StatusModel.create({
      title: "Active",
      label: "active",
      color: "#00FF00",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    bundleLocationStatus = await BundleLocationConfigStatusesModel.create({
      title: "Waiting for area configuration",
      label: "waiting_for_area_configuration",
      color: "#808080",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    const defaultPriority = await PriorityModel.create({
      title: "High",
      label: "High priority",
      color: "#ff0000",
      is_default: true,
      is_active: true,
      is_deleted: false,
      status_id: activeStatus._id,
    });

    testUser = await UserModel.create({
      first_name: "John",
      last_name: "Doe",
      email: "testuser@example.com",
      role: "super_admin",
      status_id: activeStatus._id,
      priority_id: defaultPriority._id,
    });

    testIcon = await DocumentModel.create({
      name: "icon.png",
      document_type: "image",
      content_type: "image/png",
      keys: { original: "test-key" },
      status_id: activeStatus._id,
    });

    testUnit = await UnitsModel.create({
      title: "Hour",
      label: "hr",
      dimension: "time",
      color: "#000000",
      is_default: true,
      status_id: activeStatus._id,
    });

    const inrSymbol = await DocumentModel.create({
      name: "inr.png",
      document_type: "image",
      content_type: "image/png",
      keys: { original: "inr-symbol-key" },
      status_id: activeStatus._id,
    });
    inrCurrency = await CurrencyModel.create({
      title: "Indian Rupee",
      label: "inr",
      code: "INR",
      symbol: inrSymbol._id,
      status_id: activeStatus._id,
    });

    indiaCountry = await CountryModel.create({
      name: "India",
      iso_code: "IN",
      iso_code_3: "IND",
      phone_code: "+91",
      currency: "INR",
      continent: "Asia",
      status_id: activeStatus._id,
    });

    homeCleaningBundle = await BundleModel.create({
      name: "Home Cleaning Bundle",
      display_name: "Home Cleaning Display",
      code: "HC_BUNDLE_01",
      description: "Complete home cleaning bundle",
      icon: testIcon._id,
      status_id: activeStatus._id,
    });
  });

  it("should support complete CRUD operations and constraints validation on bundle country configurations", async () => {
    const payload = {
      bundle_id: homeCleaningBundle._id.toString(),
      country_id: indiaCountry._id.toString(),
      currency_id: inrCurrency._id.toString(),
      unit_id: testUnit._id.toString(),
      is_callout_bundle: false,
      is_fixed_price: true,
      price: 1500,
      estimated_time: 3,
      estimated_time_unit: timeUnits.hours,
      individual_services_total: 2000,
      bundle_discount_type: "FIXED",
      bundle_discount_value: 500,
    };

    // 1. Create Config
    let createResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult =
        await createBundleCountryConfigurationService.execute({
          body: payload,
        } as any);
    });

    expect(createResult.result.code).toBe(201);
    const configId = createResult.result.data[0].result.id;
    expect(configId).toBeDefined();
    expect(createResult.result.data[0].result.price).toBe(1500);
    expect(createResult.result.data[0].result.status).toBeDefined();

    // 1.5 Duplicate test
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult =
        await createBundleCountryConfigurationService.execute({
          body: payload,
        } as any);
    });
    expect(duplicateResult.result.code).toBe(409);

    // 2. List Configs
    const listResult: any =
      await listBundleCountryConfigurationService.execute({
        query: { bundle_id: homeCleaningBundle._id.toString() },
      } as any);
    expect(listResult.result.code).toBe(200);
    expect(listResult.result.data[0].result.length).toBe(1);

    // 3. Show Config
    const showResult: any =
      await showBundleCountryConfigurationService.execute(configId);
    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.price).toBe(1500);

    // 4. Update Config
    let updateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult =
        await updateBundleCountryConfigurationService.execute(
          configId,
          {
            body: { price: 1400, bundle_discount_value: 600 },
          } as any,
        );
    });
    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.price).toBe(1400);
    expect(updateResult.result.data[0].result.bundle_discount_value).toBe(600);

    // 5. Delete Config
    let deleteResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteResult =
        await deleteBundleCountryConfigurationService.execute(configId);
    });
    expect(deleteResult.result.code).toBe(200);

    // Verify soft-deleted is not found
    const findDeleted = await BundleCountryConfigurationModel.findOne({
      _id: configId,
      is_deleted: false,
    });
    expect(findDeleted).toBeNull();
  });
});
