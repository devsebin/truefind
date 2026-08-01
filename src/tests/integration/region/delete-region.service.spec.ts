import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import deleteRegionService from "@/resources/v1/masters/regions/services/delete-region.service";
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

describe("DeleteRegionService (Integration)", () => {
  let testUser: any;
  let country: any;
  let region: any;
  let district: any;
  let suburb: any;
  let parentDeletedStatus: any;

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
    const defaultStatus = await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    // Seed parent deleted status
    parentDeletedStatus = await StatusModel.create({
      title: "Parent deleted",
      label: "parent_deleted",
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
      buildCountryPayload({ name: "Germany", iso_code: "DE", iso_code_3: "DEU" })
    );

    // Seed region and link to country
    region = await RegionModel.create(
      buildRegionPayload({ name: "Bavaria", code: "BY", country_id: country._id, is_active: true, is_deleted: false })
    );

    country.region_ids.push(region._id);
    await country.save();

    // Seed related child entities
    district = await DistrictModel.create(
      buildDistrictPayload({ country_id: country._id, region_id: region._id, is_active: true, is_deleted: false })
    );

    suburb = await SuburbModel.create(
      buildSuburbPayload({ country_id: country._id, region_id: region._id, district_id: district._id, is_active: true, is_deleted: false })
    );
  });

  it("should fail to delete an active region without force flag", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteRegionService.execute(region._id, testUser._id, false);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("Confirmation required");
  });

  it("should successfully soft delete an active region with force flag and pull region ID from country", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteRegionService.execute(region._id, testUser._id, true);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    // Verify soft delete attributes
    const deletedDb = await RegionModel.findOne({ _id: region._id, is_deleted: true });
    expect(deletedDb).toBeDefined();
    expect(deletedDb!.is_deleted).toBe(true);
    expect(deletedDb!.is_active).toBe(false);
    expect(deletedDb!.deleted_by!.toString()).toBe(testUser._id.toString());
    expect(deletedDb!.deleted_at).toBeDefined();

    // Verify region ID is pulled from country's region_ids array
    const updatedCountry = await CountryModel.findById(country._id);
    expect(updatedCountry!.region_ids).not.toContainEqual(region._id);

    // Verify related entities are deactivated and status is updated to parent_deleted
    const districtDb = await DistrictModel.findOne({ _id: district._id, is_deleted: false, is_active: false });
    expect(districtDb!.is_active).toBe(false);
    expect(districtDb!.status_id.toString()).toBe(parentDeletedStatus._id.toString());

    const suburbDb = await SuburbModel.findOne({ _id: suburb._id, is_deleted: false, is_active: false });
    expect(suburbDb!.is_active).toBe(false);
    expect(suburbDb!.status_id.toString()).toBe(parentDeletedStatus._id.toString());
  });

  it("should fail when trying to delete an already deleted region", async () => {
    // Delete first
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      await deleteRegionService.execute(region._id, testUser._id, true);
    });

    // Try again
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteRegionService.execute(region._id, testUser._id, true);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("already deleted");
  });

  it("should return 404 when deleting non-existent region ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteRegionService.execute(fakeId, testUser._id, true);
    });

    expect(result.result.code).toBe(404);
  });
});
