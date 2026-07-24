import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import updateDistrictsService from "@/resources/v1/masters/districts/services/update-districts.service";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import DistrictModel from "@/database/districts/districts-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildCountryPayload } from "../../factories/country.factory";
import { buildRegionPayload } from "../../factories/region.factory";
import { buildDistrictPayload } from "../../factories/district.factory";
import mongoose from "mongoose";

describe("UpdateDistrictService (Integration)", () => {
  let testUser: any;
  let testCountry: any;
  let testRegionA: any;
  let testRegionB: any;
  let district: any;

  beforeAll(async () => {
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

    testRegionA = await RegionModel.create(
      buildRegionPayload({ name: "Cairo Region", code: "CAI", country_id: testCountry._id })
    );
    testCountry.region_ids.push(testRegionA._id);
    await testCountry.save();

    testRegionB = await RegionModel.create(
      buildRegionPayload({ name: "Giza Region", code: "GIZ", country_id: testCountry._id })
    );
    testCountry.region_ids.push(testRegionB._id);
    await testCountry.save();

    district = await DistrictModel.create(
      buildDistrictPayload({ name: "Maadi", code: "MAA", country_id: testCountry._id, region_id: testRegionA._id })
    );
    testRegionA.district_ids.push(district._id);
    await testRegionA.save();
  });

  it("should successfully update district details and handle region reassignment properly", async () => {
    const payload = {
      name: "Maadi Updated",
      code: "MAAU",
      country_id: testCountry._id.toString(),
      region_id: testRegionB._id.toString(),
    };
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateDistrictsService.execute(district._id, mockReq, payload);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.name).toBe("Maadi Updated");

    // Verify old region A pulled the district ID
    const updatedRegionA = await RegionModel.findById(testRegionA._id);
    expect(updatedRegionA!.district_ids).not.toContainEqual(district._id);

    // Verify new region B pushed the district ID
    const updatedRegionB = await RegionModel.findById(testRegionB._id);
    expect(updatedRegionB!.district_ids).toContainEqual(district._id);
  });
});
