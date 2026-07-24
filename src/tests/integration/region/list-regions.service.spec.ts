import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import listRegionService from "@/resources/v1/masters/regions/services/list-region.service";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import StatusModel from "@/database/status/status-db-model";
import { buildCountryPayload } from "../../factories/country.factory";
import { buildRegionPayload } from "../../factories/region.factory";

describe("ListRegionsService (Integration)", () => {
  let testCountry: any;

  beforeAll(async () => {
    await RegionModel.ensureIndexes();
    await CountryModel.ensureIndexes();
    await StatusModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Seed default status
    await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    // Seed country
    testCountry = await CountryModel.create(
      buildCountryPayload({ name: "Brazil", iso_code: "BR", iso_code_3: "BRA" })
    );

    // Seed multiple regions
    await RegionModel.create([
      buildRegionPayload({ name: "Sao Paulo", code: "SAO", country_id: testCountry._id }),
      buildRegionPayload({ name: "Rio de Janeiro", code: "RIO", country_id: testCountry._id }),
      buildRegionPayload({ name: "Brasilia", code: "BSB", country_id: testCountry._id }),
    ]);
  });

  it("should list all regions with pagination defaults", async () => {
    const mockReq = {
      query: { page: "1", limit: "10" },
      originalUrl: "/api/v1/masters/regions",
      method: "GET",
    } as any;

    const result: any = await listRegionService.execute(mockReq);

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.totalCount).toBe(3);
    expect(result.result.data[0].result.rows.length).toBe(3);
  });

  it("should support custom pagination limit and page skip", async () => {
    const mockReq = {
      query: { page: "2", limit: "2" },
      originalUrl: "/api/v1/masters/regions",
      method: "GET",
    } as any;

    const result: any = await listRegionService.execute(mockReq);

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.totalCount).toBe(3);
    expect(result.result.data[0].result.rows.length).toBe(1); // 3rd region
  });

  it("should sort regions based on query parameters", async () => {
    const mockReq = {
      query: { order_by: "name", order_direction: "desc" },
      originalUrl: "/api/v1/masters/regions",
      method: "GET",
    } as any;

    const result: any = await listRegionService.execute(mockReq);

    expect(result.result.code).toBe(200);
    const rows = result.result.data[0].result.rows;
    expect(rows[0].name).toBe("Sao Paulo");
    expect(rows[1].name).toBe("Rio de Janeiro");
    expect(rows[2].name).toBe("Brasilia");
  });
});
