import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import showServiceDocumentService from "@/resources/v1/masters/service-documents/services/show-service-document.service";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import StatusModel from "@/database/status/status-db-model";
import { buildServiceDocumentPayload } from "../../factories/service-document.factory";
import mongoose from "mongoose";

describe("ShowServiceDocumentService (Integration)", () => {
  let doc: any;

  beforeAll(async () => {
    await serviceDocumentRequirementModel.ensureIndexes();
    await StatusModel.ensureIndexes();
  });

  beforeEach(async () => {
    await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    doc = await serviceDocumentRequirementModel.create(
      buildServiceDocumentPayload({ name: "Visa", display_name: "Visa Copy", item_code: "DOC_VISA" })
    );
  });

  it("should fetch details of a service document successfully", async () => {
    const result: any = await showServiceDocumentService.execute(doc._id);
    if (result.result.code !== 200) {
      console.error("SHOW ERROR RESULT:", JSON.stringify(result, null, 2));
    }

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.name).toBe("Visa");
    expect(result.result.data[0].result.item_code).toBe("DOC_VISA");
  });

  it("should return 404 when service document does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const result: any = await showServiceDocumentService.execute(fakeId);

    expect(result.result.code).toBe(404);
    expect(result.result.success).toBe(false);
    expect(result.result.message).toContain("Service document not found");
  });
});
