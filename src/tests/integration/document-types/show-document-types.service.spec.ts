import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import showDocumentTypesService from "@/resources/v1/masters/document-types/services/show-document-types.service";
import DocumentTypesModel from "@/database/document-types/document-types-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { buildDocumentTypesPayload } from "../../factories/document-types.factory";
import mongoose from "mongoose";

describe("ShowDocumentTypesService (Integration)", () => {
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

    await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    docType = await DocumentTypesModel.create(
      buildDocumentTypesPayload({ title: "Birth Certificate", label: "birth_cert", color: "#445566" })
    );
  });

  it("should fetch details of a document type successfully", async () => {
    const result: any = await showDocumentTypesService.execute(docType._id);

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.title).toBe("Birth Certificate");
    expect(result.result.data[0].result.label).toBe("birth_cert");
  });

  it("should return 404 when document type does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const result: any = await showDocumentTypesService.execute(fakeId);

    expect(result.result.code).toBe(404);
    expect(result.result.success).toBe(false);
    expect(result.result.message).toContain("Document type not found");
  });
});
