import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { requestContext } from "@/utils/context/request-context";
import BundleModel from "@/database/bundles/bundles-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import DistrictModel from "@/database/districts/districts-db-model";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import CurrencyModel from "@/database/currencies/currencies-db-model";
import BundleCountryConfigurationModel from "@/database/bundle-country-configuration/bundle-country-configuration-db-model";
import BundleAreaConfigurationModel from "@/database/bundle-area-configuration/bundle-area-configuration-db-model";
import BundleLocationConfigStatusesModel from "@/database/bundle-location-config-status/bundle-location-config-status-db-model";
import UnitsModel from "@/database/units/units-db-model";

import createBundleAreaConfigurationService from "@/resources/v1/bundle-area-configurations/services/create-bundle-area-configuration.service";
import listBundleAreaConfigurationService from "@/resources/v1/bundle-area-configurations/services/list-bundle-area-configuration.service";
import showBundleAreaConfigurationService from "@/resources/v1/bundle-area-configurations/services/show-bundle-area-configuration.service";
import updateBundleAreaConfigurationService from "@/resources/v1/bundle-area-configurations/services/update-bundle-area-configuration.service";
import enableBundleAreaConfigurationService from "@/resources/v1/bundle-area-configurations/services/enable-bundle-area-configuration.service";
import disableBundleAreaConfigurationService from "@/resources/v1/bundle-area-configurations/services/disable-bundle-area-configuration.service";

import {
  getActiveBundleLocationStatusId,
  getUnlinkedBundleLocationStatusId,
} from "@/utils/plugins/bundle-location-config-status.plugin";
import { timeUnits } from "@/database/services/services-db-interface";

describe("Bundle Area Configuration Service (Integration)", () => {
  let testUser: any;
  let testIcon: any;
  let testUnit: any;
  let activeStatus: any;
  let waitingLocationStatus: any;
  let indiaCountry: any;
  let australiaCountry: any;
  let inrCurrency: any;
  let homeCleaningBundle: any;
  let countryConfig: any;
  let suburb1: any;
  let suburb2: any;
  let foreignSuburb: any;

  beforeAll(async () => {
    await BundleModel.ensureIndexes();
    await DocumentModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await RegionModel.ensureIndexes();
    await DistrictModel.ensureIndexes();
    await SuburbModel.ensureIndexes();
    await CurrencyModel.ensureIndexes();
    await BundleCountryConfigurationModel.ensureIndexes();
    await BundleAreaConfigurationModel.ensureIndexes();
    await BundleLocationConfigStatusesModel.ensureIndexes();
    await UnitsModel.ensureIndexes();
  });

  beforeEach(async () => {
    await BundleAreaConfigurationModel.deleteMany({});
    await BundleCountryConfigurationModel.deleteMany({});
    await BundleLocationConfigStatusesModel.deleteMany({});
    await SuburbModel.deleteMany({});
    await DistrictModel.deleteMany({});
    await RegionModel.deleteMany({});
    await CountryModel.deleteMany({});
    await UnitsModel.deleteMany({});
    await CurrencyModel.deleteMany({});
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

    waitingLocationStatus = await BundleLocationConfigStatusesModel.create({
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

    australiaCountry = await CountryModel.create({
      name: "Australia",
      iso_code: "AU",
      iso_code_3: "AUS",
      phone_code: "+61",
      currency: "AUD",
      continent: "Oceania",
      status_id: activeStatus._id,
    });

    const indiaRegion = await RegionModel.create({
      name: "Maharashtra",
      code: "MH",
      country_id: indiaCountry._id,
      status_id: activeStatus._id,
    });

    const indiaDistrict = await DistrictModel.create({
      name: "Mumbai",
      code: "MUM",
      country_id: indiaCountry._id,
      region_id: indiaRegion._id,
      status_id: activeStatus._id,
    });

    const dummyBoundary = {
      type: "Polygon" as const,
      coordinates: [
        [
          [72.8258, 18.975],
          [72.8358, 18.975],
          [72.8358, 18.985],
          [72.8258, 18.985],
          [72.8258, 18.975],
        ],
      ],
    };


    suburb1 = await SuburbModel.create({
      name: "Bandra",
      code: "BAN",
      post_code: "400050",
      country_id: indiaCountry._id,
      region_id: indiaRegion._id,
      district_id: indiaDistrict._id,
      status_id: activeStatus._id,
      boundary: dummyBoundary,
      is_active: true,
      is_deleted: false,
    });

    suburb2 = await SuburbModel.create({
      name: "Andheri",
      code: "AND",
      post_code: "400058",
      country_id: indiaCountry._id,
      region_id: indiaRegion._id,
      district_id: indiaDistrict._id,
      status_id: activeStatus._id,
      boundary: dummyBoundary,
      is_active: true,
      is_deleted: false,
    });

    const ausRegion = await RegionModel.create({
      name: "NSW",
      code: "NSW",
      country_id: australiaCountry._id,
      status_id: activeStatus._id,
    });

    const ausDistrict = await DistrictModel.create({
      name: "Sydney",
      code: "SYD",
      country_id: australiaCountry._id,
      region_id: ausRegion._id,
      status_id: activeStatus._id,
    });

    foreignSuburb = await SuburbModel.create({
      name: "Surry Hills",
      code: "SH",
      post_code: "2010",
      country_id: australiaCountry._id,
      region_id: ausRegion._id,
      district_id: ausDistrict._id,
      status_id: activeStatus._id,
      boundary: dummyBoundary,
      is_active: true,
      is_deleted: false,
    });


    homeCleaningBundle = await BundleModel.create({
      name: "Home Cleaning Bundle",
      display_name: "Home Cleaning Display",
      code: "HC_BUNDLE_01",
      description: "Complete home cleaning bundle",
      icon: testIcon._id,
      status_id: activeStatus._id,
    });

    countryConfig = await BundleCountryConfigurationModel.create({
      bundle_id: homeCleaningBundle._id,
      country_id: indiaCountry._id,
      currency_id: inrCurrency._id,
      unit_id: testUnit._id,
      is_callout_bundle: false,
      is_fixed_price: true,
      price: 1500,
      estimated_time: 3,
      estimated_time_unit: timeUnits.hours,
      individual_services_total: 2000,
      bundle_discount_type: "FIXED",
      bundle_discount_value: 500,
      status_id: waitingLocationStatus._id,
      is_active: true,
      is_deleted: false,
    });
  });

  it("should validate country_configuration_id existence", async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createBundleAreaConfigurationService.execute({
        body: {
          country_configuration_id: fakeId,
          suburb_ids: [suburb1._id.toString()],
        },
      } as any);
    });

    expect(result.result.code).toBe(404);
  });

  it("should validate suburb existence and country matching", async () => {
    // 1. Foreign suburb
    let foreignResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      foreignResult = await createBundleAreaConfigurationService.execute({
        body: {
          country_configuration_id: countryConfig._id.toString(),
          suburb_ids: [suburb1._id.toString(), foreignSuburb._id.toString()],
        },
      } as any);
    });

    expect(foreignResult.result.code).toBe(400);
    expect(
      foreignResult.result.data[0].error.details.data.invalid_suburb_ids,
    ).toContain(foreignSuburb._id.toString());


    // 2. Non existent suburb
    const fakeSuburbId = new mongoose.Types.ObjectId().toString();
    let nonExistentResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      nonExistentResult = await createBundleAreaConfigurationService.execute({
        body: {
          country_configuration_id: countryConfig._id.toString(),
          suburb_ids: [fakeSuburbId],
        },
      } as any);
    });

    expect(nonExistentResult.result.code).toBe(404);
  });

  it("should create bundle area configurations and update bundle country status to active", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createBundleAreaConfigurationService.execute({
        body: {
          country_configuration_id: countryConfig._id.toString(),
          suburb_ids: [suburb1._id.toString(), suburb2._id.toString()],
        },
      } as any);
    });

    expect(result.result.code).toBe(201);
    expect(result.result.data[0].result.length).toBe(2);

    const createdConfigs = await BundleAreaConfigurationModel.find({
      bundle_id: homeCleaningBundle._id,
      country_configuration_id: countryConfig._id,
    });
    expect(createdConfigs.length).toBe(2);
    expect(createdConfigs[0].is_active).toBe(true);

    const activeLocationStatusId = await getActiveBundleLocationStatusId();
    expect(createdConfigs[0].status_id.toString()).toBe(
      activeLocationStatusId.toString(),
    );

    // Verify parent bundle_country_configuration status is now Active
    const updatedCountryConfig = await BundleCountryConfigurationModel.findById(
      countryConfig._id,
    );
    expect(updatedCountryConfig?.status_id.toString()).toBe(
      activeLocationStatusId.toString(),
    );
  });

  it("should support list and show bundle area configurations", async () => {
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      await createBundleAreaConfigurationService.execute({
        body: {
          country_configuration_id: countryConfig._id.toString(),
          suburb_ids: [suburb1._id.toString()],
        },
      } as any);
    });

    const listResult: any = await listBundleAreaConfigurationService.execute({
      query: { bundle_id: homeCleaningBundle._id.toString() },
    } as any);
    expect(listResult.result.code).toBe(200);
    expect(listResult.result.data[0].result.length).toBe(1);

    const areaConfigId = listResult.result.data[0].result[0].id;
    const showResult: any =
      await showBundleAreaConfigurationService.execute(areaConfigId);
    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.id.toString()).toBe(
      areaConfigId.toString(),
    );
  });

  it("should support update, disable, and enable operations with status_id handling", async () => {
    let createRes: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createRes = await createBundleAreaConfigurationService.execute({
        body: {
          country_configuration_id: countryConfig._id.toString(),
          suburb_ids: [suburb1._id.toString()],
        },
      } as any);
    });

    const configId = createRes.result.data[0].result[0].id;

    // 1. Update config price
    let updateRes: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateRes = await updateBundleAreaConfigurationService.execute(
        configId,
        {
          body: { price: 1800 },
        } as any,
      );
    });
    expect(updateRes.result.code).toBe(200);
    expect(updateRes.result.data[0].result.price).toBe(1800);

    // 2. Disable config -> should set is_active: false and status_id to unlinked
    let disableRes: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableRes =
        await disableBundleAreaConfigurationService.execute(configId);
    });
    expect(disableRes.result.code).toBe(200);
    expect(disableRes.result.data[0].result.is_active).toBe(false);



    const unlinkedStatusId = await getUnlinkedBundleLocationStatusId();
    expect(disableRes.result.data[0].result.status.id.toString()).toBe(
      unlinkedStatusId.toString(),
    );

    // Disabling again should conflict
    let duplicateDisableRes: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateDisableRes =
        await disableBundleAreaConfigurationService.execute(configId);
    });
    expect(duplicateDisableRes.result.code).toBe(409);

    // 3. Enable config -> should set is_active: true and status_id to active
    let enableRes: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableRes = await enableBundleAreaConfigurationService.execute(configId);
    });
    expect(enableRes.result.code).toBe(200);
    expect(enableRes.result.data[0].result.is_active).toBe(true);
    const activeStatusId = await getActiveBundleLocationStatusId();
    expect(enableRes.result.data[0].result.status.id.toString()).toBe(
      activeStatusId.toString(),
    );

    // Enabling again should conflict
    let duplicateEnableRes: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateEnableRes =
        await enableBundleAreaConfigurationService.execute(configId);
    });
    expect(duplicateEnableRes.result.code).toBe(409);
  });
});
