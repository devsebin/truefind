import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import createRegionService from "@/resources/v1/masters/regions/services/create-region.service";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildCountryPayload } from "../../factories/country.factory";
import { buildRegionPayload } from "../../factories/region.factory";
import mongoose from "mongoose";

describe("CreateRegionService (Integration)", () => {
  let testUser: any;
  let testCountry: any;

  beforeAll(async () => {
    await RegionModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Seed default status first
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

    // Seed test user
    testUser = await UserModel.create({
      first_name: "John",
      last_name: "Doe",
      email: "testuser@example.com",
      role: "super_admin",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });

    // Seed test country
    testCountry = await CountryModel.create(
      buildCountryPayload({ name: "Egypt", iso_code: "EG", iso_code_3: "EGY" })
    );
  });

  it("should successfully create a new region and push its ID to the country's region_ids field", async () => {
    const payload = buildRegionPayload({ country_id: testCountry._id.toString() });
    const mockReq = {
      body: payload,
    } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createRegionService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(201);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.name).toBe(payload.name);

    // Verify region ID is pushed to country's region_ids array
    const updatedCountry = await CountryModel.findById(testCountry._id);
    expect(updatedCountry!.region_ids).toContainEqual(new mongoose.Types.ObjectId(result.result.data[0].result.id));

    // Verify audit logs on Region
    const createdRegion = await RegionModel.findById(result.result.data[0].result.id);
    expect(createdRegion!.created_by!.toString()).toBe(testUser._id.toString());
  });

  it("should reject region creation with duplicate name", async () => {
    // Seed existing region
    await RegionModel.create(
      buildRegionPayload({ name: "Cairo", code: "CAI", country_id: testCountry._id })
    );

    const payload = buildRegionPayload({ name: "Cairo", code: "DIFFERENT", country_id: testCountry._id.toString() });
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createRegionService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.message).toContain("already exists");
  });

  it("should reject region creation with duplicate code", async () => {
    // Seed existing region
    await RegionModel.create(
      buildRegionPayload({ name: "Cairo", code: "CAI", country_id: testCountry._id })
    );

    const payload = buildRegionPayload({ name: "DIFFERENT", code: "CAI", country_id: testCountry._id.toString() });
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createRegionService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.message).toContain("already exists");
  });
});
