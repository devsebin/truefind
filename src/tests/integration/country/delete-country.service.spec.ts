import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import deleteCountryService from "@/resources/v1/masters/countries/services/delete-country.service";
import CountryModel from "@/database/countries/countries-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildCountryPayload } from "../../factories/country.factory";
import mongoose from "mongoose";

describe("DeleteCountryService (Integration)", () => {
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

    // Seed country to delete
    country = await CountryModel.create(
      buildCountryPayload({ name: "Italy", iso_code: "IT", iso_code_3: "ITA", is_active: true, is_deleted: false })
    );
  });

  it("should fail to delete an active country without force flag", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteCountryService.execute(country._id, testUser._id, false);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("Confirmation required");
  });

  it("should successfully soft delete an active country with force flag and populate deleted_by/deleted_at", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteCountryService.execute(country._id, testUser._id, true);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    // Bypass default active query filter by passing is_deleted in query
    const deletedDb = await CountryModel.findOne({ _id: country._id, is_deleted: true });
    expect(deletedDb).toBeDefined();
    expect(deletedDb!.is_deleted).toBe(true);
    expect(deletedDb!.is_active).toBe(false);
    expect(deletedDb!.deleted_by!.toString()).toBe(testUser._id.toString());
    expect(deletedDb!.deleted_at).toBeDefined();
  });

  it("should fail when trying to delete an already deleted country", async () => {
    // Delete first
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      await deleteCountryService.execute(country._id, testUser._id, true);
    });

    // Try again
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteCountryService.execute(country._id, testUser._id, true);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("already deleted");
  });

  it("should return 404 when deleting non-existent country ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteCountryService.execute(fakeId, testUser._id, true);
    });

    expect(result.result.code).toBe(404);
  });
});
