import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import showDeclaimerService from "@/resources/v1/masters/declaimers/services/show-declaimer.service";
import DeclaimerModel from "@/database/declaimers/declaimers-db-model";
import StatusModel from "@/database/status/status-db-model";
import { buildDeclaimerPayload } from "../../factories/declaimer.factory";
import mongoose from "mongoose";

describe("ShowDeclaimerService (Integration)", () => {
  let declaimer: any;

  beforeAll(async () => {
    await DeclaimerModel.ensureIndexes();
    await StatusModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Seed default status (required by defaultStatusPlugin)
    await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    declaimer = await DeclaimerModel.create(
      buildDeclaimerPayload({ key: "terms_of_service", version: 1, is_latest: true })
    );
  });

  it("should fetch details of a declaimer successfully", async () => {
    const result: any = await showDeclaimerService.execute(declaimer._id);

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.key).toBe("terms_of_service");
  });

  it("should return 404 when declaimer does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const result: any = await showDeclaimerService.execute(fakeId);

    expect(result.result.code).toBe(404);
    expect(result.result.success).toBe(false);
    expect(result.result.message).toContain("Declaimer not found");
  });
});
