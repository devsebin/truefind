import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import createDocumentTypesService from "@/resources/v1/masters/document-types/services/create-document-types.service";
import DocumentTypesModel from "@/database/document-types/document-types-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildDocumentTypesPayload } from "../../factories/document-types.factory";

describe("CreateDocumentTypesService (Integration)", () => {
  let testUser: any;

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
  });

  it("should successfully create a new document type and set created_by", async () => {
    const payload = buildDocumentTypesPayload({ title: "Identification", label: "id_proof", color: "#112233" });
    const mockReq = {
      body: payload,
    } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createDocumentTypesService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(201);
    expect(result.result.data[0].result.title).toBe("Identification");
    expect(result.result.data[0].result.label).toBe("id_proof");
    expect(result.result.data[0].result.is_default).toBe(true); // First item becomes default

    const dbDocType = await DocumentTypesModel.findOne({ title: "Identification" });
    expect(dbDocType).toBeDefined();
    expect(dbDocType!.created_by.toString()).toBe(testUser._id.toString());
  });

  it("should reject creation with duplicate title/label if active", async () => {
    const payload1 = buildDocumentTypesPayload({ title: "Passport", label: "passport", color: "#ff0000" });
    const payload2 = buildDocumentTypesPayload({ title: "Passport", label: "passport_2", color: "#00ff00" });

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      await createDocumentTypesService.execute({ body: payload1 } as any, payload1);
    });

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createDocumentTypesService.execute({ body: payload2 } as any, payload2);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.success).toBe(false);
  });
});
