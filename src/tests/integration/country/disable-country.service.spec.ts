import { describe, it, expect, beforeEach } from "@jest/globals";
import disableCountryService from "@/resources/v1/masters/countries/services/disable-country.service";
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

describe("DisableCountryService (Integration)", () => {
  let testUser: any;
  let country: any;
  let region: any;
  let district: any;
  let suburb: any;
  let parentDisabledStatus: any;

  beforeAll(async () => {
    await CountryModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await RegionModel.ensureIndexes();
    await DistrictModel.ensureIndexes();
    await SuburbModel.ensureIndexes();
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

    // Seed test user
    testUser = await UserModel.create({
      first_name: "John",
      last_name: "Doe",
      email: "testuser@example.com",
      role: "super_admin",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });

    // Seed active country
    country = await CountryModel.create(
      buildCountryPayload({ name: "Greece", iso_code: "GR", iso_code_3: "GRC", is_active: true, is_deleted: false })
    );

    // Seed related child entities
    region = await RegionModel.create(
      buildRegionPayload({ country_id: country._id, is_active: true, is_deleted: false })
    );

    district = await DistrictModel.create(
      buildDistrictPayload({ country_id: country._id, region_id: region._id, is_active: true, is_deleted: false })
    );

    suburb = await SuburbModel.create(
      buildSuburbPayload({ country_id: country._id, region_id: region._id, district_id: district._id, is_active: true, is_deleted: false })
    );
  });

  it("should successfully disable an active country", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await disableCountryService.execute(country._id, testUser._id);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    // Bypass default active query filter by passing is_deleted in query
    const inactiveDb = await CountryModel.findOne({ _id: country._id, is_deleted: false });
    expect(inactiveDb).toBeDefined();
    expect(inactiveDb!.is_active).toBe(false);

    // Verify related entities are deactivated and status is updated to parent_disabled
    const regionDb = await RegionModel.findOne({ _id: region._id, is_deleted: false, is_active: false });
    expect(regionDb!.is_active).toBe(false);
    expect(regionDb!.status_id.toString()).toBe(parentDisabledStatus._id.toString());

    const districtDb = await DistrictModel.findOne({ _id: district._id, is_deleted: false, is_active: false });
    expect(districtDb!.is_active).toBe(false);
    expect(districtDb!.status_id.toString()).toBe(parentDisabledStatus._id.toString());

    const suburbDb = await SuburbModel.findOne({ _id: suburb._id, is_deleted: false, is_active: false });
    expect(suburbDb!.is_active).toBe(false);
    expect(suburbDb!.status_id.toString()).toBe(parentDisabledStatus._id.toString());
  });

  it("should fail when trying to disable an already inactive country", async () => {
    // Set inactive first
    country.is_active = false;
    await country.save();

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await disableCountryService.execute(country._id, testUser._id);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("already inactive");
  });

  it("should return 404 when disabling non-existent country ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await disableCountryService.execute(fakeId, testUser._id);
    });

    expect(result.result.code).toBe(404);
  });
});
