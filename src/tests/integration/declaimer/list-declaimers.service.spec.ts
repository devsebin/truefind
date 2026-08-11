import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import listDeclaimersService from "@/resources/v1/masters/declaimers/services/list-declaimers.service";
import DeclaimerModel from "@/database/declaimers/declaimers-db-model";
import StatusModel from "@/database/status/status-db-model";
import { buildDeclaimerPayload } from "../../factories/declaimer.factory";

describe("ListDeclaimersService (Integration)", () => {
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

    await DeclaimerModel.create([
      buildDeclaimerPayload({ title: "Alpha Terms", key: "terms_of_service", version: 1, is_latest: true }),
      buildDeclaimerPayload({ title: "Beta Privacy", key: "privacy_policy", version: 1, is_latest: true }),
      buildDeclaimerPayload({ title: "Gamma Contact", key: "contact_us", version: 1, is_latest: true }),
    ]);
  });

  it("should list all declaimers with pagination defaults", async () => {
    const mockReq = {
      query: { page: "1", limit: "10" },
      originalUrl: "/api/v1/masters/declaimers",
      method: "GET",
    } as any;

    const result: any = await listDeclaimersService.execute(mockReq);

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.totalCount).toBe(3);
    expect(result.result.data[0].result.rows.length).toBe(3);
  });

  it("should support custom pagination limit and page skip", async () => {
    const mockReq = {
      query: { page: "2", limit: "2" },
      originalUrl: "/api/v1/masters/declaimers",
      method: "GET",
    } as any;

    const result: any = await listDeclaimersService.execute(mockReq);

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.totalCount).toBe(3);
    expect(result.result.data[0].result.rows.length).toBe(1);
  });

  it("should sort declaimers based on query parameters", async () => {
    const mockReq = {
      query: { order_by: "title", order_direction: "desc" },
      originalUrl: "/api/v1/masters/declaimers",
      method: "GET",
    } as any;

    const result: any = await listDeclaimersService.execute(mockReq);

    expect(result.result.code).toBe(200);
    const rows = result.result.data[0].result.rows;
    expect(rows[0].title).toBe("Gamma Contact");
    expect(rows[1].title).toBe("Beta Privacy");
    expect(rows[2].title).toBe("Alpha Terms");
  });
});
