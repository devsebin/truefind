import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import deleteDocumentTypesService from "@/resources/v1/masters/document-types/services/delete-document-types.service";
import DocumentTypesModel from "@/database/document-types/document-types-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildDocumentTypesPayload } from "../../factories/document-types.factory";
import mongoose from "mongoose";

describe("DeleteDocumentTypesService (Integration)", () => {
  let testUser: any;
  let docType: any;

  beforeAll(async () => {
    try {
      await DocumentTypesModel.collection.dropIndexes();
    } catch (e) {}
    await DocumentTypesModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    await DocumentTypesModel.deleteMany({});
    await UserModel.deleteMany({});
    await StatusModel.deleteMany({});
    await PriorityModel.deleteMany({});

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

    // Create a default doc type and a non-default doc type
    await DocumentTypesModel.create(
      buildDocumentTypesPayload({ title: "Primary Type", label: "primary_type", is_default: true })
    );

    docType = await DocumentTypesModel.create(
      buildDocumentTypesPayload({ title: "Secondary Type", label: "secondary_type", is_default: false })
    );
  });

  it("should fail to delete without force flag", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteDocumentTypesService.execute(docType._id, testUser._id, false);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("Confirmation required");
  });

  it("should soft delete document type with force flag", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteDocumentTypesService.execute(docType._id, testUser._id, true);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const deletedDb = await DocumentTypesModel.findOne({ _id: docType._id, is_deleted: true });
    expect(deletedDb).toBeDefined();
    expect(deletedDb!.is_deleted).toBe(true);
    expect(deletedDb!.is_active).toBe(false);
    expect(deletedDb!.deleted_by!.toString()).toBe(testUser._id.toString());
  });

  it("should prevent deleting default document type", async () => {
    const defaultDoc = await DocumentTypesModel.findOne({ is_default: true });

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await deleteDocumentTypesService.execute(defaultDoc!._id, testUser._id, true);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.message).toContain("Cannot delete default document type");
  });
});
