import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import deleteServiceDocumentService from "@/resources/v1/masters/service-documents/services/delete-service-document.service";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildServiceDocumentPayload } from "../../factories/service-document.factory";
import mongoose from "mongoose";

describe("DeleteServiceDocumentService (Integration)", () => {
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
      buildServiceDocumentPayload({ name: "Tax Return", item_code: "DOC_TAX", is_active: true, is_deleted: false })
    );
  });

  it("should fail to delete an active service document without force flag", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteServiceDocumentService.execute(doc._id, testUser._id, false);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("Confirmation required");
  });

  it("should successfully soft delete an active service document with force flag", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteServiceDocumentService.execute(doc._id, testUser._id, true);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const deletedDb = await serviceDocumentRequirementModel.findOne({ _id: doc._id, is_deleted: true });
    expect(deletedDb).toBeDefined();
    expect(deletedDb!.is_deleted).toBe(true);
    expect(deletedDb!.is_active).toBe(false);
    expect(deletedDb!.deleted_by!.toString()).toBe(testUser._id.toString());
    expect(deletedDb!.deleted_at).toBeDefined();
  });

  it("should fail when trying to delete an already deleted service document", async () => {
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      await deleteServiceDocumentService.execute(doc._id, testUser._id, true);
    });

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteServiceDocumentService.execute(doc._id, testUser._id, true);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("already deleted");
  });

  it("should return 404 when deleting non-existent service document ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteServiceDocumentService.execute(fakeId, testUser._id, true);
    });

    expect(result.result.code).toBe(404);
  });
});
