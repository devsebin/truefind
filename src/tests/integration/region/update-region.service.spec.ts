import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import updateRegionService from "@/resources/v1/masters/regions/services/update-region.service";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildCountryPayload } from "../../factories/country.factory";
import { buildRegionPayload } from "../../factories/region.factory";
import mongoose from "mongoose";

describe("UpdateRegionService (Integration)", () => {
  let testUser: any;
  let countryA: any;
  let countryB: any;
  let region: any;

  beforeAll(async () => {
    await RegionModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Seed default status
    const defaultStatus = await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    // Seed default priority
    const defaultPriority = await PriorityModel.create({
      title: "High",
      label: "High priority",
      color: "#ff0000",
      is_default: true,
      is_active: true,
      is_deleted: false,
      status_id: defaultStatus._id,
    });

    // Seed user
    testUser = await UserModel.create({
      first_name: "John",
      last_name: "Doe",
      email: "testuser@example.com",
      role: "super_admin",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });

    // Seed country A
    countryA = await CountryModel.create(
      buildCountryPayload({ name: "United States", iso_code: "US", iso_code_3: "USA" })
    );

    // Seed country B
    countryB = await CountryModel.create(
      buildCountryPayload({ name: "United Kingdom", iso_code: "GB", iso_code_3: "GBR" })
    );

    // Seed region under country A and add to country A's region_ids
    region = await RegionModel.create(
      buildRegionPayload({ name: "New York", code: "NY", country_id: countryA._id })
    );

    countryA.region_ids.push(region._id);
    await countryA.save();
  });

  it("should successfully update region details and record updated_by", async () => {
    const payload = {
      name: "New York Updated",
      code: "NYU",
      country_id: countryA._id.toString(),
    };
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateRegionService.execute(region._id, mockReq, payload);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.name).toBe("New York Updated");
    expect(result.result.data[0].result.code).toBe("NYU");

    // Verify audit logs on Region
    const updatedDb = await RegionModel.findById(region._id);
    expect(updatedDb!.updated_by!.toString()).toBe(testUser._id.toString());
  });

  it("should handle country reassignment properly by removing from old country and adding to new country", async () => {
    const payload = {
      name: region.name,
      code: region.code,
      country_id: countryB._id.toString(),
    };
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateRegionService.execute(region._id, mockReq, payload);
    });

    expect(result.result.code).toBe(200);

    // Verify old country A pulled the region ID
    const updatedCountryA = await CountryModel.findById(countryA._id);
    expect(updatedCountryA!.region_ids).not.toContainEqual(region._id);

    // Verify new country B pushed the region ID
    const updatedCountryB = await CountryModel.findById(countryB._id);
    expect(updatedCountryB!.region_ids).toContainEqual(region._id);
  });

  it("should reject updates that cause name/code conflict with another region", async () => {
    // Seed another region under Country A
    await RegionModel.create(
      buildRegionPayload({ name: "California", code: "CA", country_id: countryA._id })
    );

    const payload = {
      name: "California",
      code: "CA",
      country_id: countryA._id.toString(),
    };
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateRegionService.execute(region._id, mockReq, payload);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.message).toContain("already exists");
  });

  it("should return 404 when updating non-existent region", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const payload = {
      name: "Fake State",
      code: "FKS",
      country_id: countryA._id.toString(),
    };
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateRegionService.execute(fakeId, mockReq, payload);
    });

    expect(result.result.code).toBe(404);
  });
});
