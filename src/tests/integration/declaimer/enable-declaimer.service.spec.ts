import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import enableDeclaimerService from "@/resources/v1/masters/declaimers/services/enable-declaimer.service";
import DeclaimerModel from "@/database/declaimers/declaimers-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildDeclaimerPayload } from "../../factories/declaimer.factory";

describe("EnableDeclaimerService (Integration)", () => {
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
        is_active: false,
        is_deleted: false,
      })
    );
  });

  it("should successfully enable an inactive declaimer", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await enableDeclaimerService.execute(declaimer._id, testUser._id);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const dbDeclaimer = await DeclaimerModel.findById(declaimer._id);
    expect(dbDeclaimer!.is_active).toBe(true);
    expect(dbDeclaimer!.updated_by?.toString()).toBe(testUser._id.toString());
  });
});
