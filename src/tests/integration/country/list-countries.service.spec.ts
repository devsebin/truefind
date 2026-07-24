import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import listCountryService from "@/resources/v1/masters/countries/services/list-countries.service";
import CountryModel from "@/database/countries/countries-db-model";
import StatusModel from "@/database/status/status-db-model";
import { buildCountryPayload } from "../../factories/country.factory";

describe("ListCountriesService (Integration)", () => {
  beforeAll(async () => {
    // Ensure all indexes are fully built before starting tests to avoid lock timeouts
    await CountryModel.ensureIndexes();
    await StatusModel.ensureIndexes();
  });

  beforeEach(async () => {
    // Seed default status (required by defaultStatusPlugin on CountryModel)
    await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    // Create multiple countries for pagination, sorting and filtering tests
    await CountryModel.create([
      buildCountryPayload({ name: "Argentina", iso_code: "AR", iso_code_3: "ARG" }),
      buildCountryPayload({ name: "Brazil", iso_code: "BR", iso_code_3: "BRA" }),
      buildCountryPayload({ name: "Colombia", iso_code: "CO", iso_code_3: "COL" }),
    ]);
  });

  it("should list all countries with pagination defaults", async () => {
    const mockReq = {
      query: { page: "1", limit: "10" },
      originalUrl: "/api/v1/masters/countries",
      method: "GET",
    } as any;

    const result: any = await listCountryService.execute(mockReq);

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.totalCount).toBe(3);
    expect(result.result.data[0].result.rows.length).toBe(3);
  });

  it("should support custom pagination limit and page skip", async () => {
    const mockReq = {
      query: { page: "2", limit: "2" },
      originalUrl: "/api/v1/masters/countries",
      method: "GET",
    } as any;

    const result: any = await listCountryService.execute(mockReq);

    expect(result.result.code).toBe(200);
    expect(result.result.data[0].result.totalCount).toBe(3);
    expect(result.result.data[0].result.rows.length).toBe(1); // 3rd country
  });

  it("should sort countries based on query parameters", async () => {
    const mockReq = {
      query: { order_by: "name", order_direction: "desc" },
      originalUrl: "/api/v1/masters/countries",
      method: "GET",
    } as any;

    const result: any = await listCountryService.execute(mockReq);

    expect(result.result.code).toBe(200);
    const rows = result.result.data[0].result.rows;
    expect(rows[0].name).toBe("Colombia");
    expect(rows[1].name).toBe("Brazil");
    expect(rows[2].name).toBe("Argentina");
  });
});
