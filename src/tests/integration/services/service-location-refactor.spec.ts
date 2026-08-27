import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { requestContext } from "@/utils/context/request-context";
import { BaseServiceModel, ServiceModel } from "@/database/services/services-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import DistrictModel from "@/database/districts/districts-db-model";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import CurrencyModel from "@/database/currencies/currencies-db-model";
import ServiceCountryConfigurationModel from "@/database/service-country-configuration/service-country-configuration.model";
import ServiceAreaConfigurationModel from "@/database/service-area-configuration/service-area-configuration.model";
import UnitsModel from "@/database/units/units-db-model";
import { buildSuburbPayload } from "../../factories/suburb.factory";

import createCountryConfigurationService from "@/resources/v1/service-country-configurations/services/create-country-configuration.service";
import listCountryConfigurationService from "@/resources/v1/service-country-configurations/services/list-country-configuration.service";
import showCountryConfigurationService from "@/resources/v1/service-country-configurations/services/show-country-configuration.service";
import updateCountryConfigurationService from "@/resources/v1/service-country-configurations/services/update-country-configuration.service";
import deleteCountryConfigurationService from "@/resources/v1/service-country-configurations/services/delete-country-configuration.service";
import bulkCreateAreaOverrideService from "@/resources/v1/service-area-configurations/services/bulk-create-area-override.service";
import showEffectiveConfigService from "@/resources/v1/service-area-configurations/services/show-effective-config.service";
import listAvailableServicesService from "@/resources/v1/service-area-configurations/services/list-available-services.service";
import updateServiceAreaConfigurationService from "@/resources/v1/service-area-configurations/services/update-service-area-configuration.service";
import enableServiceAreaConfigurationService from "@/resources/v1/service-area-configurations/services/enable-service-area-configuration.service";
import disableServiceAreaConfigurationService from "@/resources/v1/service-area-configurations/services/disable-service-area-configuration.service";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { timeUnits } from "@/database/services/services-db-interface";

describe("Service Location Config Refactor (Integration)", () => {
  let testUser: any;
  let testIcon: any;
  let testUnit: any;
  let activeStatus: any;

  let indiaCountry: any;
  let usaCountry: any;

  let inrCurrency: any;
  let usdCurrency: any;

  let indiaRegion: any;
  let usaRegion: any;

  let indiaDistrict: any;
  let usaDistrict: any;

  let kakkanadSuburb: any;
  let edappallySuburb: any;
  let nySuburb: any;

  let plumbingService: any;
  let cleaningService: any;

  beforeAll(async () => {
    await BaseServiceModel.ensureIndexes();
    await DocumentModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await RegionModel.ensureIndexes();
    await DistrictModel.ensureIndexes();
    await SuburbModel.ensureIndexes();
    await CurrencyModel.ensureIndexes();
    await ServiceCountryConfigurationModel.ensureIndexes();
    await ServiceAreaConfigurationModel.ensureIndexes();
    await UnitsModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Clear collections
    await ServiceAreaConfigurationModel.deleteMany({});
    await ServiceCountryConfigurationModel.deleteMany({});
    await UnitsModel.deleteMany({});
    await CurrencyModel.deleteMany({});
    await SuburbModel.deleteMany({});
    await DistrictModel.deleteMany({});
    await RegionModel.deleteMany({});
    await CountryModel.deleteMany({});
    await BaseServiceModel.deleteMany({});
    await UserModel.deleteMany({});
    await DocumentModel.deleteMany({});
    await StatusModel.deleteMany({});
    await PriorityModel.deleteMany({});

    // Seed statuses & priorities
    activeStatus = await StatusModel.create({
      title: "Active",
      label: "active",
      color: "#00FF00",
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

    // Seed currencies
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

    const usdSymbol = await DocumentModel.create({
      name: "usd.png",
      document_type: "image",
      content_type: "image/png",
      keys: { original: "usd-symbol-key" },
      status_id: activeStatus._id,
    });
    usdCurrency = await CurrencyModel.create({
      title: "US Dollar",
      label: "usd",
      code: "USD",
      symbol: usdSymbol._id,
      status_id: activeStatus._id,
    });

    // Seed countries
    indiaCountry = await CountryModel.create({
      name: "India",
      iso_code: "IN",
      iso_code_3: "IND",
      phone_code: "+91",
      currency: "INR",
      continent: "Asia",
      status_id: activeStatus._id,
    });

    usaCountry = await CountryModel.create({
      name: "United States",
      iso_code: "US",
      iso_code_3: "USA",
      phone_code: "+1",
      currency: "USD",
      continent: "North America",
      status_id: activeStatus._id,
    });

    // Seed regions
    indiaRegion = await RegionModel.create({
      name: "Kerala",
      code: "KL",
      country_id: indiaCountry._id,
      status_id: activeStatus._id,
    });

    usaRegion = await RegionModel.create({
      name: "New York",
      code: "NY",
      country_id: usaCountry._id,
      status_id: activeStatus._id,
    });

    // Seed districts
    indiaDistrict = await DistrictModel.create({
      name: "Ernakulam",
      code: "EKM",
      country_id: indiaCountry._id,
      region_id: indiaRegion._id,
      status_id: activeStatus._id,
    });

    usaDistrict = await DistrictModel.create({
      name: "Manhattan",
      code: "MHT",
      country_id: usaCountry._id,
      region_id: usaRegion._id,
      status_id: activeStatus._id,
    });

    // Seed suburbs
    kakkanadSuburb = await SuburbModel.create(buildSuburbPayload({
      name: "Kakkanad",
      code: "KKN",
      country_id: indiaCountry._id,
      region_id: indiaRegion._id,
      district_id: indiaDistrict._id,
      post_code: "682030",
      status_id: activeStatus._id,
    }));

    edappallySuburb = await SuburbModel.create(buildSuburbPayload({
      name: "Edappally",
      code: "EDP",
      country_id: indiaCountry._id,
      region_id: indiaRegion._id,
      district_id: indiaDistrict._id,
      post_code: "682024",
      status_id: activeStatus._id,
    }));

    nySuburb = await SuburbModel.create(buildSuburbPayload({
      name: "Midtown",
      code: "MID",
      country_id: usaCountry._id,
      region_id: usaRegion._id,
      district_id: usaDistrict._id,
      post_code: "10001",
      status_id: activeStatus._id,
    }));

    // Seed global services
    plumbingService = await ServiceModel.create({
      name: "Plumbing",
      type: serviceTypes.Service,
      description: "Professional plumbing",
      icon: testIcon._id,
      estimated_time: 2,
      estimated_time_unit: timeUnits.hours,
      status_id: activeStatus._id,
    });

    cleaningService = await ServiceModel.create({
      name: "Cleaning",
      type: serviceTypes.Service,
      description: "Professional cleaning",
      icon: testIcon._id,
      estimated_time: 3,
      estimated_time_unit: timeUnits.hours,
      status_id: activeStatus._id,
    });
  });

  it("should support complete Country Configuration CRUD operations", async () => {
    // 1. Create Country Config
    const payload = {
      service_id: plumbingService._id.toString(),
      country_id: indiaCountry._id.toString(),
      required_licenses: true,
      is_callout_service: true,
      is_fixed_price: false,
      currency_id: inrCurrency._id.toString(),
      unit_id: testUnit._id.toString(),
      minimum_unit_price: 500,
      maximum_unit_price: 5000,
      call_out_fee: 300,
    };

    let createResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult = await createCountryConfigurationService.execute({ body: payload } as any);
    });

    if (createResult.result.code !== 201) {
      console.error("CREATE COUNTRY CONFIG ERROR:", JSON.stringify(createResult));
    }

    expect(createResult.result.code).toBe(201);
    const configId = createResult.result.data[0].result.id;
    expect(configId).toBeDefined();

    // 1.5 Duplicate test (should fail due to unique index validation in service logic)
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult = await createCountryConfigurationService.execute({ body: payload } as any);
    });
    expect(duplicateResult.result.code).toBe(409);

    // 2. List Configs
    const listResult: any = await listCountryConfigurationService.execute({
      query: { service_id: plumbingService._id.toString() },
    } as any);
    expect(listResult.result.code).toBe(200);
    expect(listResult.result.data[0].result.length).toBe(1);

    // 3. Show Config
    const showResult: any = await showCountryConfigurationService.execute(configId);
    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.required_licenses).toBe(true);

    // 4. Update Config
    let updateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updateCountryConfigurationService.execute(configId, {
        body: { call_out_fee: 350 },
      } as any);
    });
    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.call_out_fee).toBe(350);

    // 5. Delete Config
    let deleteResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteResult = await deleteCountryConfigurationService.execute(configId);
    });
    expect(deleteResult.result.code).toBe(200);

    // Verify soft-deleted is not found
    const findDeleted = await ServiceCountryConfigurationModel.findOne({ _id: configId, is_deleted: false });
    expect(findDeleted).toBeNull();
  });

  it("should support bulk suburb area override configurations assignment", async () => {
    // 1. Create India configuration
    await ServiceCountryConfigurationModel.create({
      service_id: plumbingService._id,
      country_id: indiaCountry._id,
      required_licenses: true,
      is_callout_service: true,
      is_fixed_price: false,
      currency_id: inrCurrency._id,
      unit_id: testUnit._id,
      minimum_unit_price: 500,
      maximum_unit_price: 5000,
      call_out_fee: 300,
      status_id: activeStatus._id,
    });

    // 2. Perform bulk area overrides for multiple suburbs
    const suburbsPayload = [
      {
        suburb_id: kakkanadSuburb._id.toString(),
        required_licenses: true,
        is_callout_service: true,
        is_fixed_price: false,
        unit_id: testUnit._id.toString(),
        minimum_unit_price: 600,
        maximum_unit_price: 5000,
        call_out_fee: 450,
        is_active: true,
      },
      {
        suburb_id: edappallySuburb._id.toString(),
        required_licenses: true,
        is_callout_service: true,
        is_fixed_price: false,
        unit_id: testUnit._id.toString(),
        minimum_unit_price: 600,
        maximum_unit_price: 5000,
        call_out_fee: 450,
        is_active: true,
      }
    ];

    let bulkResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      bulkResult = await bulkCreateAreaOverrideService.execute(
        plumbingService._id,
        suburbsPayload
      );
    });

    expect(bulkResult.result.code).toBe(201);
    expect(bulkResult.result.data[0].result.length).toBe(2);

    // 2.5 Test duplicate suburb check in bulk payload
    const duplicatePayload = [
      {
        suburb_id: kakkanadSuburb._id.toString(),
        required_licenses: true,
        is_callout_service: true,
        is_fixed_price: false,
        unit_id: testUnit._id.toString(),
        minimum_unit_price: 600,
        maximum_unit_price: 5000,
        call_out_fee: 450,
        is_active: true,
      },
      {
        suburb_id: kakkanadSuburb._id.toString(), // Duplicate!
        required_licenses: true,
        is_callout_service: true,
        is_fixed_price: false,
        unit_id: testUnit._id.toString(),
        minimum_unit_price: 600,
        maximum_unit_price: 5000,
        call_out_fee: 450,
        is_active: true,
      }
    ];

    let duplicateBulkResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateBulkResult = await bulkCreateAreaOverrideService.execute(
        plumbingService._id,
        duplicatePayload
      );
    });
    expect(duplicateBulkResult.result.code).toBe(400);
    expect(duplicateBulkResult.result.message).toBe("Duplicate suburbs found in the payload.");

    // Verify Kakkanad override
    const kknConfig = await ServiceAreaConfigurationModel.findOne({
      service_id: plumbingService._id,
      suburb_id: kakkanadSuburb._id,
    });
    expect(kknConfig).toBeDefined();
    expect(kknConfig!.call_out_fee).toBe(450);
    expect(kknConfig!.minimum_unit_price).toBe(600);
  });

  it("should merge effective configurations and distinguish explicit false vs undefined", async () => {
    // 1. Setup country configuration (India: is_callout_service=true, required_licenses=true)
    await ServiceCountryConfigurationModel.create({
      service_id: plumbingService._id,
      country_id: indiaCountry._id,
      required_licenses: true,
      is_callout_service: true,
      is_fixed_price: false,
      currency_id: inrCurrency._id,
      unit_id: testUnit._id,
      minimum_unit_price: 500,
      maximum_unit_price: 5000,
      call_out_fee: 300,
      status_id: activeStatus._id,
    });

    // 2. Setup area override (Kakkanad: is_callout_service=false [explicit false], call_out_fee=400, but required_licenses is undefined/omitted)
    await ServiceAreaConfigurationModel.create({
      service_id: plumbingService._id,
      suburb_id: kakkanadSuburb._id,
      is_callout_service: false, // explicit false override
      call_out_fee: 400,
      status_id: activeStatus._id,
    });

    // 3. Query Effective Configuration
    const effectiveResult: any = await showEffectiveConfigService.execute(
      plumbingService._id,
      kakkanadSuburb._id
    );

    expect(effectiveResult.result.code).toBe(200);
    const data = effectiveResult.result.data[0].result;

    // Check callout service (explicit false override)
    expect(data.effective_config.is_callout_service.value).toBe(false);
    expect(data.effective_config.is_callout_service.source).toBe("area");

    // Check required licenses (inherits from country since omitted at area level)
    expect(data.effective_config.required_licenses.value).toBe(true);
    expect(data.effective_config.required_licenses.source).toBe("country");

    // Check call out fee (overridden at area level)
    expect(data.effective_config.call_out_fee.value).toBe(400);
    expect(data.effective_config.call_out_fee.source).toBe("area");

    // Check estimated time (inherits from global service defaults since not overridden)
    expect(data.effective_config.estimated_time.value).toBe(2);
    expect(data.effective_config.estimated_time.source).toBe("global");
  });

  it("should return the effective services available in a suburb via available API", async () => {
    // India Config
    await ServiceCountryConfigurationModel.create({
      service_id: plumbingService._id,
      country_id: indiaCountry._id,
      required_licenses: true,
      is_callout_service: true,
      is_fixed_price: false,
      currency_id: inrCurrency._id,
      unit_id: testUnit._id,
      minimum_unit_price: 500,
      maximum_unit_price: 5000,
      call_out_fee: 300,
      status_id: activeStatus._id,
    });

    // India config for Cleaning
    await ServiceCountryConfigurationModel.create({
      service_id: cleaningService._id,
      country_id: indiaCountry._id,
      required_licenses: false,
      is_callout_service: false,
      is_fixed_price: true,
      currency_id: inrCurrency._id,
      unit_id: testUnit._id,
      price: 200,
      status_id: activeStatus._id,
    });

    // India override for Edappally suburb
    await ServiceAreaConfigurationModel.create({
      service_id: plumbingService._id,
      suburb_id: edappallySuburb._id,
      call_out_fee: 400,
      status_id: activeStatus._id,
    });

    // USA Config for Midtown suburb
    await ServiceCountryConfigurationModel.create({
      service_id: plumbingService._id,
      country_id: usaCountry._id,
      required_licenses: true,
      is_callout_service: false,
      is_fixed_price: true,
      currency_id: usdCurrency._id,
      unit_id: testUnit._id,
      price: 150,
      status_id: activeStatus._id,
    });

    // 1. Fetch available services for Indian suburb Edappally
    const edappallyResult: any = await listAvailableServicesService.execute(edappallySuburb._id);
    expect(edappallyResult.result.code).toBe(200);
    expect(edappallyResult.result.data[0].result.services.length).toBe(2); // Plumbing and Cleaning (both configured now)

    const edappallyPlumbing = edappallyResult.result.data[0].result.services.find((s: any) => s.id.toString() === plumbingService._id.toString());
    expect(edappallyPlumbing).toBeDefined();
    expect(edappallyPlumbing.currency.code).toBe("INR");
    expect(edappallyPlumbing.call_out_fee).toBe(400); // Suburb override
    expect(edappallyPlumbing.minimum_unit_price).toBe(500); // Inherits from country
    expect(edappallyPlumbing.is_fixed_price).toBe(false);

    // 2. Fetch available services for US suburb Midtown
    const nyResult: any = await listAvailableServicesService.execute(nySuburb._id);
    expect(nyResult.result.code).toBe(200);
    const nyPlumbing = nyResult.result.data[0].result.services.find((s: any) => s.id.toString() === plumbingService._id.toString());
    expect(nyPlumbing).toBeDefined();
    expect(nyPlumbing.currency.code).toBe("USD");
    expect(nyPlumbing.call_out_fee).toBe(null); // is_callout_service is false
    expect(nyPlumbing.is_fixed_price).toBe(true);
    expect(nyPlumbing.price).toBe(150);

    // Test Inactive logic: deactivate a service in area configuration for Edappally
    await ServiceAreaConfigurationModel.create({
      service_id: cleaningService._id,
      suburb_id: edappallySuburb._id,
      is_active: false,
      status_id: activeStatus._id,
    });

    const deactivatedResult: any = await listAvailableServicesService.execute(edappallySuburb._id);
    expect(deactivatedResult.result.code).toBe(200);
    // Cleaning is now deactivated for Edappally suburb, so only Plumbing should be returned
    const activeEdappallyServices = deactivatedResult.result.data[0].result.services;
    expect(activeEdappallyServices.length).toBe(1);
    expect(activeEdappallyServices[0].id.toString()).toBe(plumbingService._id.toString());
  });

  it("should support updating, enabling, and disabling single service area configurations", async () => {
    // 1. Create a configuration record
    const config = await ServiceAreaConfigurationModel.create({
      service_id: plumbingService._id,
      suburb_id: kakkanadSuburb._id,
      required_licenses: true,
      is_callout_service: true,
      is_fixed_price: false,
      unit_id: testUnit._id,
      minimum_unit_price: 500,
      maximum_unit_price: 5000,
      call_out_fee: 300,
      is_active: true,
      status_id: activeStatus._id,
    });

    // 2. Update config
    let updateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updateServiceAreaConfigurationService.execute(config._id, {
        body: { call_out_fee: 420 },
      } as any);
    });
    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.call_out_fee).toBe(420);

    // 3. Disable config
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult = await disableServiceAreaConfigurationService.execute(config._id);
    });
    expect(disableResult.result.code).toBe(200);
    expect(disableResult.result.data[0].result.is_active).toBe(false);

    // 4. Enable config
    let enableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableResult = await enableServiceAreaConfigurationService.execute(config._id);
    });
    expect(enableResult.result.code).toBe(200);
    expect(enableResult.result.data[0].result.is_active).toBe(true);
  });
});
