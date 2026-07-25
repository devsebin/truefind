import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import showSuburbsService from "@/resources/v1/masters/suburbs/services/show-suburbs.service";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import DistrictModel from "@/database/districts/districts-db-model";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { buildCountryPayload } from "../../factories/country.factory";
import { buildRegionPayload } from "../../factories/region.factory";
import { buildDistrictPayload } from "../../factories/district.factory";
import { buildSuburbPayload } from "../../factories/suburb.factory";

describe("ShowSuburbService (Integration)", () => {
  let testUser: any;
  let testCountry: any;
  let testRegion: any;
  let testDistrict: any;
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

    suburb = await SuburbModel.create(
      buildSuburbPayload({
        name: "Zamalek Suburb",
        code: "ZAMS",
        country_id: testCountry._id,
        region_id: testRegion._id,
        district_id: testDistrict._id,
        is_active: true,
        is_deleted: false,
      })
    );
  });

  it("should successfully fetch a suburb by ID", async () => {
    const result = await showSuburbsService.execute(suburb._id);

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.name).toBe("Zamalek Suburb");
  });
});
