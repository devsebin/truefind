import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import disableServiceDocumentService from "@/resources/v1/masters/service-documents/services/disable-service-document.service";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildServiceDocumentPayload } from "../../factories/service-document.factory";
import mongoose from "mongoose";

describe("DisableServiceDocumentService (Integration)", () => {
  let testUser: any;
  let doc: any;

  beforeAll(async () => {
    await serviceDocumentRequirementModel.ensureIndexes();
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

    doc = await serviceDocumentRequirementModel.create(
      buildServiceDocumentPayload({ name: "Medical Certificate", item_code: "DOC_MED", is_active: true, is_deleted: false })
    );
  });

  it("should successfully disable an active service document", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await disableServiceDocumentService.execute(doc._id, testUser._id);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const inactiveDb = await serviceDocumentRequirementModel.findById(doc._id);
    expect(inactiveDb!.is_active).toBe(false);
  });

  it("should fail when trying to disable an already inactive service document", async () => {
    doc.is_active = false;
    await doc.save();

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await disableServiceDocumentService.execute(doc._id, testUser._id);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("already inactive");
  });

  it("should return 404 when disabling non-existent service document ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await disableServiceDocumentService.execute(fakeId, testUser._id);
    });

    expect(result.result.code).toBe(404);
  });
});
