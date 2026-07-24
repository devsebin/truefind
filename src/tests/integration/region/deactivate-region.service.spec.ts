import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import deactivateRegionService from "@/resources/v1/masters/regions/services/deactivate-region.service";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildCountryPayload } from "../../factories/country.factory";
import { buildRegionPayload } from "../../factories/region.factory";
import mongoose from "mongoose";

describe("DeactivateRegionService (Integration)", () => {
  let testUser: any;
  let country: any;
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

    // Seed country
    country = await CountryModel.create(
      buildCountryPayload({ name: "Italy", iso_code: "IT", iso_code_3: "ITA" })
    );

    // Seed active region
    region = await RegionModel.create(
      buildRegionPayload({ name: "Tuscany", code: "TUS", country_id: country._id, is_active: true, is_deleted: false })
    );
  });

  it("should successfully deactivate an active region", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deactivateRegionService.execute(region._id, testUser._id);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    // Bypass default active filter when querying inactive regions by passing is_deleted filter
    const inactiveDb = await RegionModel.findOne({ _id: region._id, is_deleted: false });
    expect(inactiveDb).toBeDefined();
    expect(inactiveDb!.is_active).toBe(false);
  });

  it("should fail when trying to deactivate an already inactive region", async () => {
    // Set inactive first
    region.is_active = false;
    await region.save();

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deactivateRegionService.execute(region._id, testUser._id);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("already inactive");
  });

  it("should return 404 when deactivating non-existent region ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deactivateRegionService.execute(fakeId, testUser._id);
    });

    expect(result.result.code).toBe(404);
  });
});
