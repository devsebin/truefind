import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import createDistrictsService from "@/resources/v1/masters/districts/services/create-districts.service";
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

describe("CreateDistrictService (Integration)", () => {
  let testUser: any;
  let testCountry: any;
  let testRegion: any;

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
  });

  it("should successfully create a new district and push its ID to the region's district_ids field", async () => {
    const payload = buildDistrictPayload({
      country_id: testCountry._id.toString(),
      region_id: testRegion._id.toString(),
    });
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createDistrictsService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(201);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.name).toBe(payload.name);

    const updatedRegion = await RegionModel.findById(testRegion._id);
    expect(updatedRegion!.district_ids).toContainEqual(new mongoose.Types.ObjectId(result.result.data[0].result.id));

    const createdDistrict = await DistrictModel.findById(result.result.data[0].result.id);
    expect(createdDistrict!.created_by!.toString()).toBe(testUser._id.toString());
  });

  it("should reject district creation with duplicate name", async () => {
    await DistrictModel.create(
      buildDistrictPayload({ name: "Heliopolis", code: "HEL", country_id: testCountry._id, region_id: testRegion._id })
    );

    const payload = buildDistrictPayload({
      name: "Heliopolis",
      code: "DIFFERENT",
      country_id: testCountry._id.toString(),
      region_id: testRegion._id.toString(),
    });
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createDistrictsService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.message).toContain("already exists");
  });
});
