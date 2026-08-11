import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import deleteDeclaimerService from "@/resources/v1/masters/declaimers/services/delete-declaimer.service";
import DeclaimerModel from "@/database/declaimers/declaimers-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildDeclaimerPayload } from "../../factories/declaimer.factory";

describe("DeleteDeclaimerService (Integration)", () => {
  let testUser: any;
  let declaimer: any;

  beforeAll(async () => {
    await DeclaimerModel.ensureIndexes();
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

    declaimer = await DeclaimerModel.create(
      buildDeclaimerPayload({
        key: "terms_of_service",
        version: 1,
        is_latest: true,
        is_active: true,
        is_deleted: false,
      })
    );
  });

  it("should successfully soft delete a declaimer when force is true", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteDeclaimerService.execute(declaimer._id, testUser._id, true);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const dbDeclaimer = await DeclaimerModel.findOne({ _id: declaimer._id, is_deleted: true });
    expect(dbDeclaimer!.is_deleted).toBe(true);
    expect(dbDeclaimer!.is_active).toBe(false);
    expect(dbDeclaimer!.deleted_by?.toString()).toBe(testUser._id.toString());
  });

  it("should reject deletion if force is false and declaimer is active", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteDeclaimerService.execute(declaimer._id, testUser._id, false);
    });

    expect(result.result.code).toBe(409); // Conflict
    expect(result.result.message).toContain("Confirmation required");
  });
});
