import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import createDeclaimerService from "@/resources/v1/masters/declaimers/services/create-declaimer.service";
import DeclaimerModel from "@/database/declaimers/declaimers-db-model";
import CountryModel from "@/database/countries/countries-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildDeclaimerPayload } from "../../factories/declaimer.factory";
import { buildCountryPayload } from "../../factories/country.factory";

describe("CreateDeclaimerService (Integration)", () => {
  let testUser: any;
  let testCountry: any;

  beforeAll(async () => {
    await DeclaimerModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Seed default status first
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

    // Seed test country
    testCountry = await CountryModel.create(
      buildCountryPayload({ name: "New Zealand", iso_code: "NZ", iso_code_3: "NZL" })
    );
  });

  it("should successfully create a new declaimer and set created_by", async () => {
    const payload = buildDeclaimerPayload({ country: "NZ", key: "terms_of_service" });
    const mockReq = {
      body: payload,
    } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createDeclaimerService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(201);
    expect(result.result.data[0].result.key).toBe("terms_of_service");
    expect(result.result.data[0].result.version).toBe(1);

    // Verify persistence
    const dbDeclaimer = await DeclaimerModel.findOne({ key: "terms_of_service", country: testCountry._id });
    expect(dbDeclaimer).toBeDefined();
    expect(dbDeclaimer!.created_by.toString()).toBe(testUser._id.toString());
  });

  it("should reject creation if duplicate declaimer is targeted", async () => {
    const payload1 = buildDeclaimerPayload({ country: "NZ", key: "privacy_policy", language: "en" });
    const payload2 = buildDeclaimerPayload({ country: "NZ", key: "privacy_policy", language: "en" });

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      await createDeclaimerService.execute({ body: payload1 } as any, payload1);
    });

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createDeclaimerService.execute({ body: payload2 } as any, payload2);
    });

    expect(result.result.code).toBe(409); // Conflict
    expect(result.result.message).toContain("already exists");
  });

  it("should reject creation if country does not exist", async () => {
    const payload = buildDeclaimerPayload({ country: "XX" }); // Non-existent country code
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createDeclaimerService.execute({ body: payload } as any, payload);
    });

    expect(result.result.code).toBe(400); // Bad Request
    expect(result.result.message).toContain("does not exist");
  });
});
