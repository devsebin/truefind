import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import updateSuburbsService from "@/resources/v1/masters/suburbs/services/update-suburbs.service";
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

describe("UpdateSuburbService (Integration)", () => {
  let testUser: any;
  let testCountry: any;
  let testRegion: any;
  let testDistrict: any;
  let anotherDistrict: any;
  let suburb: any;

  beforeAll(async () => {
    await SuburbModel.ensureIndexes();
    await DistrictModel.ensureIndexes();
    await RegionModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
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

    testDistrict = await DistrictModel.create(
      buildDistrictPayload({ name: "Zamalek", code: "ZAM", country_id: testCountry._id, region_id: testRegion._id })
    );
    testRegion.district_ids.push(testDistrict._id);
    await testRegion.save();

    anotherDistrict = await DistrictModel.create(
      buildDistrictPayload({ name: "Maadi", code: "MAA", country_id: testCountry._id, region_id: testRegion._id })
    );
    testRegion.district_ids.push(anotherDistrict._id);
    await testRegion.save();

    suburb = await SuburbModel.create(
      buildSuburbPayload({
        name: "Old Suburb",
        code: "OLD",
        country_id: testCountry._id,
        region_id: testRegion._id,
        district_id: testDistrict._id,
        is_active: true,
        is_deleted: false,
      })
    );
    testDistrict.suburb_ids.push(suburb._id);
    await testDistrict.save();
  });

  it("should successfully update fields, move suburb ID to new parent district, and pop old parent", async () => {
    const payload = {
      name: "New Suburb Name",
      code: "NEW",
      district_id: anotherDistrict._id.toString(),
    };
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateSuburbsService.execute(suburb._id, mockReq, payload);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.name).toBe("New Suburb Name");

    // Verify pulled from old district
    const updatedOldDistrict = await DistrictModel.findById(testDistrict._id);
    expect(updatedOldDistrict!.suburb_ids).not.toContainEqual(suburb._id);

    // Verify pushed to new district
    const updatedNewDistrict = await DistrictModel.findById(anotherDistrict._id);
    expect(updatedNewDistrict!.suburb_ids).toContainEqual(suburb._id);
  });
});
