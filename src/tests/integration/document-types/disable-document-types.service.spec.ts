import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import disableDocumentTypesService from "@/resources/v1/masters/document-types/services/disable-document-types.service";
import DocumentTypesModel from "@/database/document-types/document-types-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildDocumentTypesPayload } from "../../factories/document-types.factory";

describe("DisableDocumentTypesService (Integration)", () => {
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

    await DocumentTypesModel.create(
      buildDocumentTypesPayload({ title: "Primary Type", label: "primary_type", is_default: true, is_active: true, is_deleted: false })
    );

    docType = await DocumentTypesModel.create(
      buildDocumentTypesPayload({ title: "Active Non-Default", label: "active_non_default", is_default: false, is_active: true, is_deleted: false })
    );
  });

  it("should successfully disable an active non-default document type", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await disableDocumentTypesService.execute(docType._id, testUser._id);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const inactiveDb = await DocumentTypesModel.findOne({ _id: docType._id, is_deleted: false });
    expect(inactiveDb).toBeDefined();
    expect(inactiveDb!.is_active).toBe(false);
  });

  it("should fail to disable default document type", async () => {
    const defaultDoc = await DocumentTypesModel.findOne({ is_default: true });

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await disableDocumentTypesService.execute(defaultDoc!._id, testUser._id);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.message).toContain("Cannot disable default document type");
  });
});
