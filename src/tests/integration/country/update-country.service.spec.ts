import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import updateCountryService from "@/resources/v1/masters/countries/services/update-country.service";
import CountryModel from "@/database/countries/countries-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildCountryPayload } from "../../factories/country.factory";
import mongoose from "mongoose";

describe("UpdateCountryService (Integration)", () => {
  let testUser: any;
  let country: any;

  beforeAll(async () => {
    // Ensure all indexes are fully built before starting tests to avoid lock timeouts
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

    // Seed country to update
    country = await CountryModel.create(
      buildCountryPayload({ name: "France", iso_code: "FR", iso_code_3: "FRA" })
    );
  });

  it("should successfully update country details and set updated_by", async () => {
    const payload = {
      name: "France Updated",
      iso_code: "FR",
      iso_code_3: "FRA",
      phone_code: country.phone_code,
      currency: "EUR",
      continent: country.continent,
      timezone: country.timezone,
    };
    const mockReq = {
      body: payload,
    } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateCountryService.execute(country._id, mockReq, payload);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.name).toBe("France Updated");
    expect(result.result.data[0].result.currency).toBe("EUR");

    // Fetch from database and verify audit tracking
    const updatedDb = await CountryModel.findById(country._id);
    expect(updatedDb!.updated_by!.toString()).toBe(testUser._id.toString());
  });

  it("should reject updates that cause duplicate conflicts with another country", async () => {
    const otherCountry = await CountryModel.create(
      buildCountryPayload({ name: "Germany", iso_code: "DE", iso_code_3: "DEU" })
    );

    const payload = {
      name: "Germany",
      iso_code: country.iso_code,
      iso_code_3: country.iso_code_3,
      phone_code: country.phone_code,
      currency: country.currency,
      continent: country.continent,
      timezone: country.timezone,
    };
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateCountryService.execute(country._id, mockReq, payload);
    });

    expect(result.result.code).toBe(409); // Conflict
    expect(result.result.message).toContain("already exists");
  });

  it("should return 404 when updating non-existent country", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const payload = {
      name: "Fake Name",
      iso_code: "XX",
      iso_code_3: "XXX",
      phone_code: country.phone_code,
      currency: country.currency,
      continent: country.continent,
      timezone: country.timezone,
    };
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateCountryService.execute(fakeId, mockReq, payload);
    });

    expect(result.result.code).toBe(404);
  });
});
