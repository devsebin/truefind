import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import listDocumentTypesService from "@/resources/v1/masters/document-types/services/list-document-types.service";
import DocumentTypesModel from "@/database/document-types/document-types-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { buildDocumentTypesPayload } from "../../factories/document-types.factory";

describe("ListDocumentTypesService (Integration)", () => {
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

    await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    await DocumentTypesModel.create([
      buildDocumentTypesPayload({ title: "Address Proof", label: "address_proof", color: "#111111" }),
      buildDocumentTypesPayload({ title: "Identity Proof", label: "identity_proof", color: "#222222" }),
      buildDocumentTypesPayload({ title: "Income Proof", label: "income_proof", color: "#333333" }),
    ]);
  });

  it("should list all document types with pagination defaults", async () => {
    const mockReq = {
      query: { page: "1", limit: "10" },
      originalUrl: "/api/v1/masters/document-types",
      method: "GET",
    } as any;

    const result: any = await listDocumentTypesService.execute(mockReq);

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.totalCount).toBe(3);
    expect(result.result.data[0].result.rows.length).toBe(3);
  });

  it("should support custom pagination limit and page skip", async () => {
    const mockReq = {
      query: { page: "2", limit: "2" },
      originalUrl: "/api/v1/masters/document-types",
      method: "GET",
    } as any;

    const result: any = await listDocumentTypesService.execute(mockReq);

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.totalCount).toBe(3);
    expect(result.result.data[0].result.rows.length).toBe(1);
  });
});
