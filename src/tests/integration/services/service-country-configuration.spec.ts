import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import { requestContext } from "@/utils/context/request-context";
import { BaseServiceModel, ServiceModel } from "@/database/services/services-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import CountryModel from "@/database/countries/countries-db-model";
import CurrencyModel from "@/database/currencies/currencies-db-model";
import ServiceCountryConfigurationModel from "@/database/service-country-configuration/service-country-configuration.model";
import UnitsModel from "@/database/units/units-db-model";

import createCountryConfigurationService from "@/resources/v1/service-country-configurations/services/create-country-configuration.service";
import listCountryConfigurationService from "@/resources/v1/service-country-configurations/services/list-country-configuration.service";
import showCountryConfigurationService from "@/resources/v1/service-country-configurations/services/show-country-configuration.service";
import updateCountryConfigurationService from "@/resources/v1/service-country-configurations/services/update-country-configuration.service";
import deleteCountryConfigurationService from "@/resources/v1/service-country-configurations/services/delete-country-configuration.service";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { timeUnits } from "@/database/services/services-db-interface";

describe("Service Country Configuration Service (Integration)", () => {
  let testUser: any;
  let testIcon: any;
  let testUnit: any;
  let activeStatus: any;
  let indiaCountry: any;
  let inrCurrency: any;
  let plumbingService: any;

  beforeAll(async () => {
    await BaseServiceModel.ensureIndexes();
    await DocumentModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await CurrencyModel.ensureIndexes();
    await ServiceCountryConfigurationModel.ensureIndexes();
    await UnitsModel.ensureIndexes();
  });

  beforeEach(async () => {
    await ServiceCountryConfigurationModel.deleteMany({});
    await UnitsModel.deleteMany({});
    await CurrencyModel.deleteMany({});
    await CountryModel.deleteMany({});
    await BaseServiceModel.deleteMany({});
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

    plumbingService = await ServiceModel.create({
      name: "Plumbing",
      type: serviceTypes.Service,
      description: "Professional plumbing",
      icon: testIcon._id,
      estimated_time: 2,
      estimated_time_unit: timeUnits.hours,
      status_id: activeStatus._id,
    });
  });

  it("should support complete CRUD operations and constraints validation", async () => {
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

    // 1. Create Config
    let createResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult = await createCountryConfigurationService.execute({ body: payload } as any);
    });

    expect(createResult.result.code).toBe(201);
    const configId = createResult.result.data[0].result.id;
    expect(configId).toBeDefined();

    // 1.5 Duplicate test
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
});
