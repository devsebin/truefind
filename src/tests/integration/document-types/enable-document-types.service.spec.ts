import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import enableDocumentTypesService from "@/resources/v1/masters/document-types/services/enable-document-types.service";
import DocumentTypesModel from "@/database/document-types/document-types-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildDocumentTypesPayload } from "../../factories/document-types.factory";
import mongoose from "mongoose";

describe("EnableDocumentTypesService (Integration)", () => {
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

    docType = await DocumentTypesModel.create(
      buildDocumentTypesPayload({ title: "Inactive Type", label: "inactive_type", is_active: false, is_deleted: false })
    );
  });

  it("should successfully enable an inactive document type", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await enableDocumentTypesService.execute(docType._id, testUser._id);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const activeDb = await DocumentTypesModel.findById(docType._id);
    expect(activeDb!.is_active).toBe(true);
  });

  it("should fail when trying to enable an already active document type", async () => {
    docType.is_active = true;
    await docType.save();

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await enableDocumentTypesService.execute(docType._id, testUser._id);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("already activated");
  });
});
