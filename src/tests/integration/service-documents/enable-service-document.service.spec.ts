import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import enableServiceDocumentService from "@/resources/v1/masters/service-documents/services/enable-service-document.service";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildServiceDocumentPayload } from "../../factories/service-document.factory";
import mongoose from "mongoose";

describe("EnableServiceDocumentService (Integration)", () => {
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
      buildServiceDocumentPayload({ name: "Payslip", item_code: "DOC_PAYSLIP", is_active: false, is_deleted: false })
    );
  });

  it("should successfully enable an inactive service document", async () => {
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await enableServiceDocumentService.execute(doc._id, testUser._id);
    });

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const activeDb = await serviceDocumentRequirementModel.findById(doc._id);
    expect(activeDb!.is_active).toBe(true);
  });

  it("should fail when trying to enable an already active service document", async () => {
    doc.is_active = true;
    await doc.save();

    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await enableServiceDocumentService.execute(doc._id, testUser._id);
    });

    expect(result.result.code).toBe(400);
    expect(result.result.message).toContain("already activated");
  });

  it("should return 404 when enabling non-existent service document ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    let result: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      result = await enableServiceDocumentService.execute(fakeId, testUser._id);
    });

    expect(result.result.code).toBe(404);
  });
});
