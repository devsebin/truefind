import { describe, it, expect, beforeEach } from "@jest/globals";
import createCountryService from "@/resources/v1/masters/countries/services/create-country.service";
import CountryModel from "@/database/countries/countries-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildCountryPayload } from "../../factories/country.factory";

describe("CreateCountryService (Integration)", () => {
  let testUser: any;

  beforeAll(async () => {
    await CountryModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Seed default status first (required by defaultStatusPlugin on both Priority and User)
    const defaultStatus = await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    // Seed default priority (required by defaultPriorityPlugin on User)
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
  });

  it("should successfully create a new country and set created_by", async () => {
    const payload = buildCountryPayload({ name: "New Zealand", iso_code: "NZ", iso_code_3: "NZL" });
    const mockReq = {
      body: payload,
    } as any;

    let result: any;
    // Run within requestContext to simulate the authenticated request flow
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createCountryService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(201);
    expect(result.result.data[0].result.name).toBe("New Zealand");
    expect(result.result.data[0].result.iso_code).toBe("NZ");

    // Retrieve from database to verify persistence and audit plugin fields
    const dbCountry = await CountryModel.findOne({ name: "New Zealand" });
    expect(dbCountry).toBeDefined();
    expect(dbCountry!.created_by.toString()).toBe(testUser._id.toString());
    // Since it's a new country, updated_by should be null
    expect(dbCountry!.updated_by).toBeNull();
  });

  it("should reject country creation with duplicate name", async () => {
    const payload1 = buildCountryPayload({ name: "Australia", iso_code: "AU", iso_code_3: "AUS" });
    const payload2 = buildCountryPayload({ name: "Australia", iso_code: "ZZ", iso_code_3: "ZZZ" });

    // Create first country
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      await createCountryService.execute({ body: payload1 } as any, payload1);
    });

    // Try to create country with duplicate name
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createCountryService.execute({ body: payload2 } as any, payload2);
    });

    expect(result.result.code).toBe(409); // Conflict status
    expect(result.result.success).toBe(false);
    expect(result.result.message).toContain("already exists");
  });

  it("should reject country creation with duplicate ISO code", async () => {
    const payload1 = buildCountryPayload({ name: "Canada", iso_code: "CA", iso_code_3: "CAN" });
    const payload2 = buildCountryPayload({ name: "Duplicate CA Code", iso_code: "CA", iso_code_3: "XXX" });

    // Create first country
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      await createCountryService.execute({ body: payload1 } as any, payload1);
    });

    // Try to create country with duplicate ISO code
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createCountryService.execute({ body: payload2 } as any, payload2);
    });

    expect(result.result.code).toBe(409); // Conflict status
    expect(result.result.success).toBe(false);
    expect(result.result.message).toContain("already exists");
  });

  it("should reject country creation with duplicate ISO 3 code", async () => {
    const payload1 = buildCountryPayload({ name: "United States", iso_code: "US", iso_code_3: "USA" });
    const payload2 = buildCountryPayload({ name: "Duplicate USA Code", iso_code: "XX", iso_code_3: "USA" });

    // Create first country
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      await createCountryService.execute({ body: payload1 } as any, payload1);
    });

    // Try to create country with duplicate ISO 3 code
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createCountryService.execute({ body: payload2 } as any, payload2);
    });

    expect(result.result.code).toBe(409); // Conflict status
    expect(result.result.success).toBe(false);
    expect(result.result.message).toContain("already exists");
  });
});
