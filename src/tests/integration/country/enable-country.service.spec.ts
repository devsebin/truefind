import { describe, it, expect, beforeEach } from "@jest/globals";
import enableCountryService from "@/resources/v1/masters/countries/services/enable-country.service";
import CountryModel from "@/database/countries/countries-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildCountryPayload } from "../../factories/country.factory";
import mongoose from "mongoose";

describe("EnableCountryService (Integration)", () => {
  let testUser: any;
  let country: any;

  beforeAll(async () => {
    await CountryModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
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

    // Seed inactive country
    country = await CountryModel.create(
      buildCountryPayload({ name: "Spain", iso_code: "ES", iso_code_3: "ESP", is_active: false, is_deleted: false })
    );
  });

  it("should successfully enable an inactive country", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await enableCountryService.execute(country._id, testUser._id);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const activeDb = await CountryModel.findById(country._id);
    expect(activeDb!.is_active).toBe(true);
  });

  it("should fail when trying to enable an already active country", async () => {
    // Set active first
    country.is_active = true;
    await country.save();

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await enableCountryService.execute(country._id, testUser._id);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("already activated");
  });

  it("should return 404 when enabling non-existent country ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await enableCountryService.execute(fakeId, testUser._id);
    });

    expect(result.result.code).toBe(404);
  });
});
