import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import createSuburbsService from "@/resources/v1/masters/suburbs/services/create-suburbs.service";
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

describe("CreateSuburbService (Integration)", () => {
  let testUser: any;
  let testCountry: any;
  let testRegion: any;
  let testDistrict: any;

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
  });

  it("should successfully create a new suburb and push its ID to the district's suburb_ids field", async () => {
    const payload = buildSuburbPayload({
      country_id: testCountry._id.toString(),
      region_id: testRegion._id.toString(),
      district_id: testDistrict._id.toString(),
    });
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createSuburbsService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(201);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.name).toBe(payload.name);

    const updatedDistrict = await DistrictModel.findById(testDistrict._id);
    expect(updatedDistrict!.suburb_ids).toContainEqual(new mongoose.Types.ObjectId(result.result.data[0].result.id));

    const createdSuburb = await SuburbModel.findById(result.result.data[0].result.id);
    expect(createdSuburb!.created_by!.toString()).toBe(testUser._id.toString());
  });

  it("should reject suburb creation with duplicate name inside the same district", async () => {
    await SuburbModel.create(
      buildSuburbPayload({
        name: "Giza Suburb",
        code: "GIZ",
        country_id: testCountry._id,
        region_id: testRegion._id,
        district_id: testDistrict._id,
      })
    );

    const payload = buildSuburbPayload({
      name: "Giza Suburb",
      code: "DIFFERENT",
      country_id: testCountry._id.toString(),
      region_id: testRegion._id.toString(),
      district_id: testDistrict._id.toString(),
    });
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createSuburbsService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.message).toContain("already exists");
  });

  it("should throw error if region does not belong to the selected country", async () => {
    const otherCountry = await CountryModel.create(
      buildCountryPayload({ name: "USA", iso_code: "US", iso_code_3: "USA" })
    );

    const payload = buildSuburbPayload({
      country_id: otherCountry._id.toString(), // mismatch with region country_id
      region_id: testRegion._id.toString(),
      district_id: testDistrict._id.toString(),
    });
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createSuburbsService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("Region does not belong to the selected country");
  });
});
