import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import createServiceDocumentService from "@/resources/v1/masters/service-documents/services/create-service-document.service";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildServiceDocumentPayload } from "../../factories/service-document.factory";
import mongoose from "mongoose";

describe("CreateServiceDocumentService (Integration)", () => {
  let testUser: any;
  let defaultStatus: any;

  beforeAll(async () => {
    await serviceDocumentRequirementModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    defaultStatus = await StatusModel.create({
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

  it("should successfully create a new service document and set created_by", async () => {
    const payload = buildServiceDocumentPayload({
      name: "Passport",
      display_name: "Passport Copy",
      item_code: "DOC_PASSPORT",
    });

    const mockReq = {
      body: payload,
      user: { id: testUser._id.toString() },
    } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createServiceDocumentService.execute(mockReq, payload);
    });

    expect(result.result.code).toBe(201);
    expect(result.result.data[0].result.name).toBe("Passport");
    expect(result.result.data[0].result.item_code).toBe("DOC_PASSPORT");

    const dbDoc = await serviceDocumentRequirementModel.findOne({ item_code: "DOC_PASSPORT" });
    expect(dbDoc).toBeDefined();
    expect(dbDoc!.created_by.toString()).toBe(testUser._id.toString());
  });

  it("should reject service document creation with duplicate item_code", async () => {
    const payload1 = buildServiceDocumentPayload({
      name: "Driving License",
      display_name: "Driving License",
      item_code: "DOC_DL",
    });

    const payload2 = buildServiceDocumentPayload({
      name: "Driving License 2",
      display_name: "Driving License 2",
      item_code: "DOC_DL",
    });

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      await createServiceDocumentService.execute({ body: payload1, user: { id: testUser._id.toString() } } as any, payload1);
    });

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createServiceDocumentService.execute({ body: payload2, user: { id: testUser._id.toString() } } as any, payload2);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.success).toBe(false);
    expect(result.result.message).toContain("already exists");
  });

  it("should reject service document creation with duplicate name", async () => {
    const payload1 = buildServiceDocumentPayload({
      name: "National ID",
      display_name: "National ID",
      item_code: "DOC_NID_1",
    });

    const payload2 = buildServiceDocumentPayload({
      name: "National ID",
      display_name: "National ID Card",
      item_code: "DOC_NID_2",
    });

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      await createServiceDocumentService.execute({ body: payload1, user: { id: testUser._id.toString() } } as any, payload1);
    });

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createServiceDocumentService.execute({ body: payload2, user: { id: testUser._id.toString() } } as any, payload2);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.success).toBe(false);
    expect(result.result.message).toContain("already exists");
  });

  it("should reject service document creation when invalid sample document id is provided", async () => {
    const fakeSampleId = new mongoose.Types.ObjectId();
    const payload = buildServiceDocumentPayload({
      name: "Tax Certificate",
      display_name: "Tax Certificate",
      item_code: "DOC_TAX",
      samples: [fakeSampleId.toString()],
    });

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await createServiceDocumentService.execute({ body: payload, user: { id: testUser._id.toString() } } as any, payload);
    });

    expect(result.result.code).toBe(404);
    expect(result.result.success).toBe(false);
    expect(result.result.message).toContain("Sample document not found");
  });
});
