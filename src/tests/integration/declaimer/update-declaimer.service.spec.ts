import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import updateDeclaimerService from "@/resources/v1/masters/declaimers/services/update-declaimer.service";
import DeclaimerModel from "@/database/declaimers/declaimers-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildDeclaimerPayload } from "../../factories/declaimer.factory";
import CountryModel from "@/database/countries/countries-db-model";
import { buildCountryPayload } from "../../factories/country.factory";

describe("UpdateDeclaimerService (Integration)", () => {
  let testUser: any;
  let declaimer: any;

  beforeAll(async () => {
    await DeclaimerModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await CountryModel.ensureIndexes();
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

    const testCountry = await CountryModel.create(
      buildCountryPayload({ name: "New Zealand", iso_code: "NZ", iso_code_3: "NZL" })
    );

    declaimer = await DeclaimerModel.create(
      buildDeclaimerPayload({
        key: "terms_of_service",
        title: "Old Title",
        content: "Old Content",
        version: 1,
        is_latest: true,
        created_by: testUser._id,
        country: testCountry._id,
      })
    );
  });

  it("should successfully update fields by creating a new version", async () => {
    const payload = {
      title: "New Title",
      content: "New Content",
    };
    const mockReq = {
      body: payload,
    } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateDeclaimerService.execute(declaimer._id, mockReq, payload);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.title).toBe("New Title");
    expect(result.result.data[0].result.content).toBe("New Content");
    expect(result.result.data[0].result.version).toBe(2);
    expect(result.result.data[0].result.is_latest).toBe(true);

    // Verify original declaimer is no longer marked as latest
    const originalInDb = await DeclaimerModel.findById(declaimer._id);
    expect(originalInDb!.is_latest).toBe(false);

    // Verify new version exists
    const newVersionInDb = await DeclaimerModel.findOne({
      key: "terms_of_service",
      version: 2,
    });
    expect(newVersionInDb).toBeDefined();
    expect(newVersionInDb!.is_latest).toBe(true);
    expect(newVersionInDb!.title).toBe("New Title");
  });

  it("should reject update if no changes are detected", async () => {
    const payload = {
      title: "Old Title",
      content: "Old Content",
    };
    const mockReq = {
      body: payload,
    } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateDeclaimerService.execute(declaimer._id, mockReq, payload);
    });

    expect(result.result.code).toBe(400); // Bad Request
    expect(result.result.message).toContain("No changes detected");
  });
});
