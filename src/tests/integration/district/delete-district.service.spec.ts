import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import deleteDistrictsService from "@/resources/v1/masters/districts/services/delete-districts.service";
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

describe("DeleteDistrictService (Integration)", () => {
  let testUser: any;
  let testCountry: any;
  let testRegion: any;
  let district: any;
  let suburb: any;
  let parentDeletedStatus: any;

  beforeAll(async () => {
    await DistrictModel.ensureIndexes();
    await RegionModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await SuburbModel.ensureIndexes();
  });

  beforeEach(async () => {
    const defaultStatus = await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    parentDeletedStatus = await StatusModel.create({
      title: "Parent deleted",
      label: "parent_deleted",
      color: "#FF0000",
      is_default: false,
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
      status_id: defaultStatus._id,
    });

    testUser = await UserModel.create({
      first_name: "John",
      last_name: "Doe",
      email: "testuser@example.com",
      role: "super_admin",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });

    testCountry = await CountryModel.create(
      buildCountryPayload({ name: "Egypt", iso_code: "EG", iso_code_3: "EGY" })
    );

    testRegion = await RegionModel.create(
      buildRegionPayload({ name: "Cairo Region", code: "CAI", country_id: testCountry._id })
    );
    testCountry.region_ids.push(testRegion._id);
    await testCountry.save();

    district = await DistrictModel.create(
      buildDistrictPayload({ name: "Zamalek", code: "ZAM", country_id: testCountry._id, region_id: testRegion._id, is_active: true, is_deleted: false })
    );
    testRegion.district_ids.push(district._id);
    await testRegion.save();

    suburb = await SuburbModel.create(
      buildSuburbPayload({ country_id: testCountry._id, region_id: testRegion._id, district_id: district._id, is_active: true, is_deleted: false })
    );
  });

  it("should successfully soft delete a district with force flag and pull ID from region", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteDistrictsService.execute(district._id, testUser._id, true);
    });

    expect(result.result.code).toBe(200);

    // Verify soft delete fields
    const deletedDb = await DistrictModel.findOne({ _id: district._id, is_deleted: true });
    expect(deletedDb).toBeDefined();
    expect(deletedDb!.is_deleted).toBe(true);
    expect(deletedDb!.is_active).toBe(false);

    // Verify pulled from Region
    const updatedRegion = await RegionModel.findById(testRegion._id);
    expect(updatedRegion!.district_ids).not.toContainEqual(district._id);

    // Verify related suburb is deactivated and status is updated to parent_deleted
    const suburbDb = await SuburbModel.findOne({ _id: suburb._id, is_deleted: false, is_active: false });
    expect(suburbDb!.is_active).toBe(false);
    expect(suburbDb!.status_id.toString()).toBe(parentDeletedStatus._id.toString());
  });
});
