import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import updateDocumentTypesService from "@/resources/v1/masters/document-types/services/update-document-types.service";
import DocumentTypesModel from "@/database/document-types/document-types-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildDocumentTypesPayload } from "../../factories/document-types.factory";
import mongoose from "mongoose";

describe("UpdateDocumentTypesService (Integration)", () => {
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
      buildDocumentTypesPayload({ title: "Insurance", label: "insurance", color: "#556677" })
    );
  });

  it("should successfully update document type details and set updated_by", async () => {
    const payload = {
      title: "Insurance Policy",
      label: "insurance_policy",
      color: "#998877",
    };
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateDocumentTypesService.execute(docType._id, mockReq, payload);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.title).toBe("Insurance Policy");
    expect(result.result.data[0].result.label).toBe("insurance_policy");

    const updatedDb = await DocumentTypesModel.findById(docType._id);
    expect(updatedDb!.updated_by!.toString()).toBe(testUser._id.toString());
  });

  it("should reject updates that cause duplicate conflicts", async () => {
    await DocumentTypesModel.create(
      buildDocumentTypesPayload({ title: "Visa", label: "visa", color: "#000000" })
    );

    const payload = {
      title: "Visa",
      label: docType.label,
      color: docType.color,
    };
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateDocumentTypesService.execute(docType._id, mockReq, payload);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.message).toContain("already exists");
  });

  it("should return 404 when updating non-existent document type", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const payload = {
      title: "Non Existent",
      label: "non_existent",
      color: "#111111",
    };
    const mockReq = { body: payload } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateDocumentTypesService.execute(fakeId, mockReq, payload);
    });

    expect(result.result.code).toBe(404);
  });
});
