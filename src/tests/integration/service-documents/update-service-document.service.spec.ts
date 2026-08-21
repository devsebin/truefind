import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import updateServiceDocumentService from "@/resources/v1/masters/service-documents/services/update-service-document.service";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildServiceDocumentPayload } from "../../factories/service-document.factory";
import mongoose from "mongoose";

describe("UpdateServiceDocumentService (Integration)", () => {
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
      buildServiceDocumentPayload({ name: "Utility Bill", display_name: "Utility Bill", item_code: "DOC_BILL" })
    );
  });

  it("should successfully update service document details", async () => {
    const payload = {
      name: "Utility Bill Updated",
      display_name: "Utility Bill Copy",
      item_code: "DOC_BILL",
      description: "Updated description",
    };
    const mockReq = { body: payload, user: { id: testUser._id.toString() } } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateServiceDocumentService.execute(doc._id, mockReq, payload as any);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.name).toBe("Utility Bill Updated");
    expect(result.result.data[0].result.description).toBe("Updated description");

    const updatedDb = await serviceDocumentRequirementModel.findById(doc._id);
    expect(updatedDb!.updated_by!.toString()).toBe(testUser._id.toString());
  });

  it("should reject updates that duplicate item_code of another document", async () => {
    await serviceDocumentRequirementModel.create(
      buildServiceDocumentPayload({ name: "Other Doc", item_code: "DOC_OTHER" })
    );

    const payload = {
      name: "Utility Bill",
      item_code: "DOC_OTHER",
    };
    const mockReq = { body: payload, user: { id: testUser._id.toString() } } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateServiceDocumentService.execute(doc._id, mockReq, payload as any);
    });

    expect(result.result.code).toBe(409);
    expect(result.result.message).toContain("already exists");
  });

  it("should return 404 when updating non-existent service document", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const payload = {
      name: "Non-existent Doc",
    };
    const mockReq = { body: payload, user: { id: testUser._id.toString() } } as any;

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await updateServiceDocumentService.execute(fakeId, mockReq, payload as any);
    });

    expect(result.result.code).toBe(404);
  });
});
