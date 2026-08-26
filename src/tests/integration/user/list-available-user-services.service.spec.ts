import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import listAvailableUserServicesService from "@/resources/v1/users/services/list-available-user-services.service";
import UserModel from "@/database/users/users-db-model";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import CountryModel from "@/database/countries/countries-db-model";
import DistrictModel from "@/database/districts/districts-db-model";
import ServiceAreaConfigurationModel from "@/database/service-area-configuration/service-area-configuration.model";
import { BaseServiceModel, CategoryServiceModel, SubcategoryServiceModel, ServiceModel } from "@/database/services/services-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { timeUnits } from "@/database/services/services-db-interface";
import { requestContext } from "@/utils/context/request-context";
import { buildSuburbPayload } from "../../factories/suburb.factory";
import mongoose from "mongoose";

describe("ListAvailableUserServicesService (Integration)", () => {
  let defaultStatus: any;
  let defaultPriority: any;
  let testIcon: any;
  let country: any;
  let regionA: any;
  let regionB: any;
  let districtA: any;
  let suburb1: any;
  let suburb2: any;
  let suburb3: any;

  let categoryHome: any;
  let subcategoryPlumbing: any;
  let serviceBathroomPlumbing: any;
  let serviceKitchenPlumbing: any;

  let subcategoryElectrical: any;
  let serviceWiring: any;
  let serviceLighting: any;

  beforeAll(async () => {
    await UserModel.ensureIndexes();
    await SuburbModel.ensureIndexes();
    await RegionModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await DistrictModel.ensureIndexes();
    await ServiceAreaConfigurationModel.ensureIndexes();
    await BaseServiceModel.ensureIndexes();
    await DocumentModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Clean up collections
    await UserModel.deleteMany({});
    await SuburbModel.deleteMany({});
    await RegionModel.deleteMany({});
    await CountryModel.deleteMany({});
    await DistrictModel.deleteMany({});
    await ServiceAreaConfigurationModel.deleteMany({});
    await BaseServiceModel.deleteMany({});
    await DocumentModel.deleteMany({});
    await StatusModel.deleteMany({});
    await PriorityModel.deleteMany({});

    // Seed basic statuses & priorities
    defaultStatus = await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    defaultPriority = await PriorityModel.create({
      title: "High",
      label: "High priority",
      color: "#ff0000",
      is_default: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    testIcon = await DocumentModel.create({
      name: "icon.png",
      document_type: "image",
      content_type: "image/png",
      keys: { original: "icon-key" },
      status_id: defaultStatus._id,
    });

    // Seed location data
    country = await CountryModel.create({
      name: "New Zealand",
      iso_code: "NZ",
      iso_code_3: "NZL",
      phone_code: "64",
      continent: "Oceania",
      currency: "NZD",
      status_id: defaultStatus._id,
    });

    regionA = await RegionModel.create({
      name: "Region A",
      code: "REGA",
      country_id: country._id,
      status_id: defaultStatus._id,
    });

    regionB = await RegionModel.create({
      name: "Region B",
      code: "REGB",
      country_id: country._id,
      status_id: defaultStatus._id,
    });

    districtA = await DistrictModel.create({
      name: "District A",
      code: "DISTA",
      region_id: regionA._id,
      country_id: country._id,
      status_id: defaultStatus._id,
    });

    suburb1 = await SuburbModel.create(buildSuburbPayload({
      name: "Suburb 1",
      code: "SUB1",
      country_id: country._id,
      region_id: regionA._id,
      district_id: districtA._id,
      post_code: "1001",
      status_id: defaultStatus._id,
    }));

    suburb2 = await SuburbModel.create(buildSuburbPayload({
      name: "Suburb 2",
      code: "SUB2",
      country_id: country._id,
      region_id: regionA._id,
      district_id: districtA._id,
      post_code: "1002",
      status_id: defaultStatus._id,
    }));

    suburb3 = await SuburbModel.create(buildSuburbPayload({
      name: "Suburb 3",
      code: "SUB3",
      country_id: country._id,
      region_id: regionB._id,
      district_id: districtA._id,
      post_code: "1003",
      status_id: defaultStatus._id,
    }));

    // Seed services hierarchy with estimated time
    serviceBathroomPlumbing = await ServiceModel.create({
      name: "Bathroom Plumbing",
      type: serviceTypes.Service,
      description: "Bathroom plumbing task",
      is_active: true,
      is_deleted: false,
      children: [],
      icon: testIcon._id,
      estimated_time: 2,
      estimated_time_unit: timeUnits.hours, // 2 hours (< 24)
      status_id: defaultStatus._id,
    });

    serviceKitchenPlumbing = await ServiceModel.create({
      name: "Kitchen Plumbing",
      type: serviceTypes.Service,
      description: "Kitchen plumbing task",
      is_active: true,
      is_deleted: false,
      children: [],
      icon: testIcon._id,
      estimated_time: 1,
      estimated_time_unit: timeUnits.days, // 24 hours (exactly 24 hours)
      status_id: defaultStatus._id,
    });

    subcategoryPlumbing = await SubcategoryServiceModel.create({
      name: "Plumbing",
      type: serviceTypes.Subcategory,
      description: "Plumbing services",
      is_active: true,
      is_deleted: false,
      children: [serviceBathroomPlumbing._id, serviceKitchenPlumbing._id],
      icon: testIcon._id,
      status_id: defaultStatus._id,
    });

    serviceWiring = await ServiceModel.create({
      name: "Wiring",
      type: serviceTypes.Service,
      description: "Electrical wiring",
      is_active: true,
      is_deleted: false,
      children: [],
      icon: testIcon._id,
      estimated_time: 48,
      estimated_time_unit: timeUnits.hours, // 48 hours (> 24)
      status_id: defaultStatus._id,
    });

    serviceLighting = await ServiceModel.create({
      name: "Lighting",
      type: serviceTypes.Service,
      description: "Electrical lighting",
      is_active: true,
      is_deleted: false,
      children: [],
      icon: testIcon._id,
      estimated_time: 30,
      estimated_time_unit: timeUnits.minutes, // 0.5 hours (< 24)
      status_id: defaultStatus._id,
    });

    subcategoryElectrical = await SubcategoryServiceModel.create({
      name: "Electrical",
      type: serviceTypes.Subcategory,
      description: "Electrical services",
      is_active: true,
      is_deleted: false,
      children: [serviceWiring._id, serviceLighting._id],
      icon: testIcon._id,
      status_id: defaultStatus._id,
    });

    categoryHome = await CategoryServiceModel.create({
      name: "Home Services",
      type: serviceTypes.Category,
      description: "All services for home maintenance",
      is_active: true,
      is_deleted: false,
      children: [subcategoryPlumbing._id, subcategoryElectrical._id],
      icon: testIcon._id,
      status_id: defaultStatus._id,
    });
  });

  it("should return empty services list if user has no suburb and no region", async () => {
    const user = await UserModel.create({
      email: "user1@example.com",
      role: "user",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });

    const mockReq = { user } as any;
    let result: any;
    await requestContext.run({ userId: user._id.toString() }, async () => {
      result = await listAvailableUserServicesService.execute(user._id.toString(), mockReq);
    });

    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result).toEqual([]);
  });

  it("should return only available services in the exact suburb with configuration attached", async () => {
    const user = await UserModel.create({
      email: "user2@example.com",
      role: "user",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
      region_id: regionA._id,
      suburb_id: suburb1._id,
    });

    // Setup configurations for Suburb 1
    await ServiceAreaConfigurationModel.create({
      service_id: serviceBathroomPlumbing._id,
      suburb_id: suburb1._id,
      price: 150,
      is_fixed_price: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    await ServiceAreaConfigurationModel.create({
      service_id: serviceWiring._id,
      suburb_id: suburb1._id,
      price: 200,
      is_fixed_price: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    // Kitchen Plumbing is not available in Suburb 1
    // Lighting is not available in Suburb 1

    const mockReq = { user } as any;
    let result: any;
    await requestContext.run({ userId: user._id.toString() }, async () => {
      result = await listAvailableUserServicesService.execute(user._id.toString(), mockReq);
    });

    expect(result.result.success).toBe(true);
    const tree = result.result.data[0].result;
    expect(tree.length).toBe(1); // Home Services

    const homeServices = tree[0];
    expect(homeServices.name).toBe("Home Services");
    expect(homeServices.children.length).toBe(2); // Plumbing and Electrical

    const plumbing = homeServices.children.find((c: any) => c.name === "Plumbing");
    expect(plumbing).toBeDefined();
    expect(plumbing.children.length).toBe(1); // Only Bathroom Plumbing
    expect(plumbing.children[0].name).toBe("Bathroom Plumbing");
    expect(plumbing.children[0].configuration).toBeDefined();
    expect(plumbing.children[0].configuration.price).toBe(150);

    const electrical = homeServices.children.find((c: any) => c.name === "Electrical");
    expect(electrical).toBeDefined();
    expect(electrical.children.length).toBe(1); // Only Wiring
    expect(electrical.children[0].name).toBe("Wiring");
    expect(electrical.children[0].configuration).toBeDefined();
    expect(electrical.children[0].configuration.price).toBe(200);
  });

  it("should fallback to region active suburbs list if suburb_id is missing on user", async () => {
    const user = await UserModel.create({
      email: "user3@example.com",
      role: "user",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
      region_id: regionA._id,
      // suburb_id is omitted
    });

    // Seed configuration for Suburb 1 (Bathroom Plumbing) and Suburb 2 (Wiring)
    await ServiceAreaConfigurationModel.create({
      service_id: serviceBathroomPlumbing._id,
      suburb_id: suburb1._id,
      price: 150,
      is_fixed_price: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    await ServiceAreaConfigurationModel.create({
      service_id: serviceWiring._id,
      suburb_id: suburb2._id,
      price: 220,
      is_fixed_price: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    const mockReq = { user } as any;
    let result: any;
    await requestContext.run({ userId: user._id.toString() }, async () => {
      result = await listAvailableUserServicesService.execute(user._id.toString(), mockReq);
    });

    expect(result.result.success).toBe(true);
    const tree = result.result.data[0].result;
    expect(tree.length).toBe(1); // Home Services

    const homeServices = tree[0];
    const plumbing = homeServices.children.find((c: any) => c.name === "Plumbing");
    const electrical = homeServices.children.find((c: any) => c.name === "Electrical");

    // Both should be present since they are active within Region A's suburbs
    expect(plumbing.children[0].name).toBe("Bathroom Plumbing");
    expect(plumbing.children[0].configuration).toBeUndefined(); // Region fallback must not expose single suburb config

    expect(electrical.children[0].name).toBe("Wiring");
    expect(electrical.children[0].configuration).toBeUndefined();
  });

  it("should handle circular dependencies gracefully and avoid infinite recursion", async () => {
    // Establish a circular dependency inside this specific test
    await ServiceModel.updateOne(
      { _id: serviceWiring._id },
      { $set: { children: [serviceLighting._id] } }
    );
    await ServiceModel.updateOne(
      { _id: serviceLighting._id },
      { $set: { children: [serviceWiring._id] } }
    );

    const user = await UserModel.create({
      email: "user4@example.com",
      role: "user",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
      region_id: regionA._id,
      suburb_id: suburb1._id,
    });

    // Make Wiring and Lighting both available
    await ServiceAreaConfigurationModel.create({
      service_id: serviceWiring._id,
      suburb_id: suburb1._id,
      price: 200,
      is_fixed_price: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    await ServiceAreaConfigurationModel.create({
      service_id: serviceLighting._id,
      suburb_id: suburb1._id,
      price: 250,
      is_fixed_price: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    const mockReq = { user, query: { service_type: "all" } } as any;
    let result: any;
    await requestContext.run({ userId: user._id.toString() }, async () => {
      result = await listAvailableUserServicesService.execute(user._id.toString(), mockReq);
    });

    expect(result.result.success).toBe(true);
    const tree = result.result.data[0].result;
    expect(tree).toBeDefined();
    // Verify that the tree built without throws and contains Home Services
    expect(tree[0].name).toBe("Home Services");
  });

  describe("service_type filtering and boundary conditions", () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await UserModel.create({
        email: "filtertest@example.com",
        role: "user",
        status_id: defaultStatus._id,
        priority_id: defaultPriority._id,
        region_id: regionA._id,
        suburb_id: suburb1._id,
      });

      // Make all 4 services available in suburb1:
      // 1. Bathroom Plumbing: 2 hours (< 24)
      // 2. Kitchen Plumbing: 1 day = 24 hours (exactly 24)
      // 3. Wiring: 48 hours (> 24)
      // 4. Lighting: 30 minutes = 0.5 hours (< 24)
      await ServiceAreaConfigurationModel.create({
        service_id: serviceBathroomPlumbing._id,
        suburb_id: suburb1._id,
        price: 150,
        is_fixed_price: true,
        is_active: true,
        is_deleted: false,
        status_id: defaultStatus._id,
      });

      await ServiceAreaConfigurationModel.create({
        service_id: serviceKitchenPlumbing._id,
        suburb_id: suburb1._id,
        price: 180,
        is_fixed_price: true,
        is_active: true,
        is_deleted: false,
        status_id: defaultStatus._id,
      });

      await ServiceAreaConfigurationModel.create({
        service_id: serviceWiring._id,
        suburb_id: suburb1._id,
        price: 200,
        is_fixed_price: true,
        is_active: true,
        is_deleted: false,
        status_id: defaultStatus._id,
      });

      await ServiceAreaConfigurationModel.create({
        service_id: serviceLighting._id,
        suburb_id: suburb1._id,
        price: 250,
        is_fixed_price: true,
        is_active: true,
        is_deleted: false,
        status_id: defaultStatus._id,
      });
    });

    it("service_type=all should return all available services", async () => {
      const mockReq = { user: testUser, query: { service_type: "all" } } as any;
      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await listAvailableUserServicesService.execute(testUser._id.toString(), mockReq);
      });

      expect(result.result.success).toBe(true);
      const tree = result.result.data[0].result;
      expect(tree.length).toBe(1); // Home Services

      const home = tree[0];
      const plumbing = home.children.find((c: any) => c.name === "Plumbing");
      const electrical = home.children.find((c: any) => c.name === "Electrical");

      expect(plumbing.children.length).toBe(2); // Bathroom Plumbing & Kitchen Plumbing
      expect(electrical.children.length).toBe(2); // Wiring & Lighting
    });

    it("service_type=quick_jobs should return services < 24 hours and exclude 24 hours and > 24 hours", async () => {
      const mockReq = { user: testUser, query: { service_type: "quick_jobs" } } as any;
      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await listAvailableUserServicesService.execute(testUser._id.toString(), mockReq);
      });

      expect(result.result.success).toBe(true);
      const tree = result.result.data[0].result;
      expect(tree.length).toBe(1);

      const home = tree[0];
      const plumbing = home.children.find((c: any) => c.name === "Plumbing");
      const electrical = home.children.find((c: any) => c.name === "Electrical");

      // Plumbing: only Bathroom Plumbing (2h), Kitchen Plumbing (24h) excluded
      expect(plumbing.children.length).toBe(1);
      expect(plumbing.children[0].name).toBe("Bathroom Plumbing");

      // Electrical: only Lighting (30m), Wiring (48h) excluded
      expect(electrical.children.length).toBe(1);
      expect(electrical.children[0].name).toBe("Lighting");
    });

    it("service_type=large_jobs should return services > 24 hours and exclude 24 hours and < 24 hours", async () => {
      const mockReq = { user: testUser, query: { service_type: "large_jobs" } } as any;
      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await listAvailableUserServicesService.execute(testUser._id.toString(), mockReq);
      });

      expect(result.result.success).toBe(true);
      const tree = result.result.data[0].result;
      expect(tree.length).toBe(1);

      const home = tree[0];
      // Plumbing has only 2h and 24h services -> empty subcategory -> pruned
      const plumbing = home.children.find((c: any) => c.name === "Plumbing");
      expect(plumbing).toBeUndefined();

      // Electrical has Wiring (48h)
      const electrical = home.children.find((c: any) => c.name === "Electrical");
      expect(electrical).toBeDefined();
      expect(electrical.children.length).toBe(1);
      expect(electrical.children[0].name).toBe("Wiring");
    });

    it("name_like should perform case-insensitive partial filtering by service name", async () => {
      const mockReq = {
        user: testUser,
        query: { service_type: "all", name_like: "PLUMB" },
      } as any;
      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await listAvailableUserServicesService.execute(testUser._id.toString(), mockReq);
      });

      expect(result.result.success).toBe(true);
      const tree = result.result.data[0].result;
      expect(tree.length).toBe(1);

      const home = tree[0];
      const plumbing = home.children.find((c: any) => c.name === "Plumbing");
      const electrical = home.children.find((c: any) => c.name === "Electrical");

      expect(plumbing).toBeDefined();
      expect(plumbing.children.length).toBe(2); // Bathroom Plumbing & Kitchen Plumbing
      expect(electrical).toBeUndefined(); // Pruned because no matching services
    });

    it("order_by=ascending should sort categories, subcategories, and services alphabetically A -> Z", async () => {
      const mockReq = {
        user: testUser,
        query: { service_type: "all", order_by: "ascending" },
      } as any;
      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await listAvailableUserServicesService.execute(testUser._id.toString(), mockReq);
      });

      expect(result.result.success).toBe(true);
      const tree = result.result.data[0].result;
      const home = tree[0];

      // Subcategories: Electrical before Plumbing
      expect(home.children[0].name).toBe("Electrical");
      expect(home.children[1].name).toBe("Plumbing");

      // Plumbing child services: Bathroom Plumbing before Kitchen Plumbing
      const plumbing = home.children.find((c: any) => c.name === "Plumbing");
      expect(plumbing.children[0].name).toBe("Bathroom Plumbing");
      expect(plumbing.children[1].name).toBe("Kitchen Plumbing");

      // Electrical child services: Lighting before Wiring
      const electrical = home.children.find((c: any) => c.name === "Electrical");
      expect(electrical.children[0].name).toBe("Lighting");
      expect(electrical.children[1].name).toBe("Wiring");
    });

    it("order_by=descending should sort categories, subcategories, and services alphabetically Z -> A", async () => {
      const mockReq = {
        user: testUser,
        query: { service_type: "all", order_by: "descending" },
      } as any;
      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await listAvailableUserServicesService.execute(testUser._id.toString(), mockReq);
      });

      expect(result.result.success).toBe(true);
      const tree = result.result.data[0].result;
      const home = tree[0];

      // Subcategories: Plumbing before Electrical
      expect(home.children[0].name).toBe("Plumbing");
      expect(home.children[1].name).toBe("Electrical");

      // Plumbing child services: Kitchen Plumbing before Bathroom Plumbing
      const plumbing = home.children.find((c: any) => c.name === "Plumbing");
      expect(plumbing.children[0].name).toBe("Kitchen Plumbing");
      expect(plumbing.children[1].name).toBe("Bathroom Plumbing");

      // Electrical child services: Wiring before Lighting
      const electrical = home.children.find((c: any) => c.name === "Electrical");
      expect(electrical.children[0].name).toBe("Wiring");
      expect(electrical.children[1].name).toBe("Lighting");
    });

    it("combining name_like, order_by, and service_type should work seamlessly", async () => {
      const mockReq = {
        user: testUser,
        query: { service_type: "quick_jobs", name_like: "ing", order_by: "descending" },
      } as any;
      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await listAvailableUserServicesService.execute(testUser._id.toString(), mockReq);
      });

      expect(result.result.success).toBe(true);
      const tree = result.result.data[0].result;
      expect(tree.length).toBe(1);

      const home = tree[0];
      // Plumbing (Bathroom Plumbing - 2h matches "ing" and <24h)
      // Electrical (Lighting - 30m matches "ing" and <24h; Wiring - 48h excluded by quick_jobs)
      expect(home.children.length).toBe(2);
      expect(home.children[0].name).toBe("Plumbing");
      expect(home.children[1].name).toBe("Electrical");

      const plumbing = home.children.find((c: any) => c.name === "Plumbing");
      expect(plumbing.children.length).toBe(1);
      expect(plumbing.children[0].name).toBe("Bathroom Plumbing");

      const electrical = home.children.find((c: any) => c.name === "Electrical");
      expect(electrical.children.length).toBe(1);
      expect(electrical.children[0].name).toBe("Lighting");
    });

    it("category_id should return only the specified root category", async () => {
      // Create another root category (e.g. Automotive Services)
      const otherCategory = await CategoryServiceModel.create({
        name: "Automotive Services",
        type: serviceTypes.Category,
        description: "Car repairs",
        is_active: true,
        is_deleted: false,
        children: [],
        icon: testIcon._id,
        status_id: defaultStatus._id,
      });

      const mockReq = {
        user: testUser,
        query: { service_type: "all", category_id: categoryHome._id.toString() },
      } as any;
      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await listAvailableUserServicesService.execute(testUser._id.toString(), mockReq);
      });

      expect(result.result.success).toBe(true);
      const tree = result.result.data[0].result;
      expect(tree.length).toBe(1);
      expect(tree[0]._id.toString()).toBe(categoryHome._id.toString());
      expect(tree[0].name).toBe("Home Services");
    });
  });
});
