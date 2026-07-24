import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import enableDistrictsService from "@/resources/v1/masters/districts/services/enable-districts.service";
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

describe("EnableDistrictService (Integration)", () => {
  let testUser: any;
  let testCountry: any;
  let testRegion: any;
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

    testRegion = await RegionModel.create(
      buildRegionPayload({ name: "Cairo Region", code: "CAI", country_id: testCountry._id })
    );
    testCountry.region_ids.push(testRegion._id);
    await testCountry.save();

    district = await DistrictModel.create(
      buildDistrictPayload({ name: "Mohandessin", code: "MOH", country_id: testCountry._id, region_id: testRegion._id, is_active: false })
    );
  });

  it("should enable a district successfully", async () => {
    let enableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableResult = await enableDistrictsService.execute(district._id, testUser._id);
    });
    expect(enableResult.result.code).toBe(200);
    const enabledDb = await DistrictModel.findOne({ _id: district._id, is_deleted: false });
    expect(enabledDb!.is_active).toBe(true);
  });
});
