import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import listServiceDocumentsService from "@/resources/v1/masters/service-documents/services/list-service-documents.service";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import StatusModel from "@/database/status/status-db-model";
import { buildServiceDocumentPayload } from "../../factories/service-document.factory";

describe("ListServiceDocumentsService (Integration)", () => {
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

    await serviceDocumentRequirementModel.create([
      buildServiceDocumentPayload({ name: "Alpha Doc", display_name: "Alpha", item_code: "DOC_A" }),
      buildServiceDocumentPayload({ name: "Beta Doc", display_name: "Beta", item_code: "DOC_B" }),
      buildServiceDocumentPayload({ name: "Gamma Doc", display_name: "Gamma", item_code: "DOC_C" }),
    ]);
  });

  it("should list all service documents with pagination defaults", async () => {
    const mockReq = {
      query: { page: "1", limit: "10" },
      originalUrl: "/api/v1/masters/service-documents",
      method: "GET",
    } as any;

    const result: any = await listServiceDocumentsService.execute(mockReq);

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.totalCount).toBe(3);
    expect(result.result.data[0].result.rows.length).toBe(3);
  });

  it("should support pagination page and limit", async () => {
    const mockReq = {
      query: { page: "2", limit: "2" },
      originalUrl: "/api/v1/masters/service-documents",
      method: "GET",
    } as any;

    const result: any = await listServiceDocumentsService.execute(mockReq);

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.totalCount).toBe(3);
    expect(result.result.data[0].result.rows.length).toBe(1);
  });

  it("should sort service documents by specified field", async () => {
    const mockReq = {
      query: { order_by: "name", order_direction: "desc" },
      originalUrl: "/api/v1/masters/service-documents",
      method: "GET",
    } as any;

    const result: any = await listServiceDocumentsService.execute(mockReq);

    expect(result.result.code).toBe(200);
    const rows = result.result.data[0].result.rows;
    expect(rows[0].name).toBe("Gamma Doc");
    expect(rows[1].name).toBe("Beta Doc");
    expect(rows[2].name).toBe("Alpha Doc");
  });
});
