import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import activateRegionService from "@/resources/v1/masters/regions/services/activate-region.service";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import DistrictModel from "@/database/districts/districts-db-model";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildCountryPayload } from "../../factories/country.factory";
import { buildRegionPayload } from "../../factories/region.factory";
import { buildDistrictPayload } from "../../factories/district.factory";
import { buildSuburbPayload } from "../../factories/suburb.factory";
import mongoose from "mongoose";

describe("ActivateRegionService (Integration)", () => {
  let testUser: any;
  let country: any;
  let region: any;
  let district: any;
  let suburb: any;
  let defaultStatus: any;
  let parentDisabledStatus: any;

  beforeAll(async () => {
    await RegionModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await DistrictModel.ensureIndexes();
    await SuburbModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Seed default status
    defaultStatus = await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    // Seed parent disabled status
    parentDisabledStatus = await StatusModel.create({
      title: "Parent disabled",
      label: "parent_disabled",
      color: "#FF0000",
      is_default: false,
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
      buildCountryPayload({ name: "France", iso_code: "FR", iso_code_3: "FRA" })
    );

    // Seed inactive region
    region = await RegionModel.create(
      buildRegionPayload({ name: "Brittany", code: "BRE", country_id: country._id, is_active: false, is_deleted: false })
    );

    // Seed related child entities (inactive and status as parent_disabled)
    district = await DistrictModel.create(
      buildDistrictPayload({ country_id: country._id, region_id: region._id, is_active: false, is_deleted: false, status_id: parentDisabledStatus._id })
    );

    suburb = await SuburbModel.create(
      buildSuburbPayload({ country_id: country._id, region_id: region._id, district_id: district._id, is_active: false, is_deleted: false, status_id: parentDisabledStatus._id })
    );
  });

  it("should successfully activate an inactive region", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await activateRegionService.execute(region._id, testUser._id);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const activeDb = await RegionModel.findById(region._id);
    expect(activeDb!.is_active).toBe(true);

    // Verify related entities are activated and status is updated to defaultStatus
    const districtDb = await DistrictModel.findOne({ _id: district._id, is_deleted: false });
    expect(districtDb!.is_active).toBe(true);
    expect(districtDb!.status_id.toString()).toBe(defaultStatus._id.toString());

    const suburbDb = await SuburbModel.findOne({ _id: suburb._id, is_deleted: false });
    expect(suburbDb!.is_active).toBe(true);
    expect(suburbDb!.status_id.toString()).toBe(defaultStatus._id.toString());
  });

  it("should fail when trying to activate an already active region", async () => {
    // Set active first
    region.is_active = true;
    await region.save();

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await activateRegionService.execute(region._id, testUser._id);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("already activated");
  });

  it("should return 404 when activating non-existent region ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await activateRegionService.execute(fakeId, testUser._id);
    });

    expect(result.result.code).toBe(404);
  });
});
