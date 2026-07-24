import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import showRegionService from "@/resources/v1/masters/regions/services/show-region.service";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import StatusModel from "@/database/status/status-db-model";
import { buildCountryPayload } from "../../factories/country.factory";
import { buildRegionPayload } from "../../factories/region.factory";
import mongoose from "mongoose";

describe("ShowRegionService (Integration)", () => {
  let testCountry: any;
  let region: any;

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
      buildCountryPayload({ name: "Canada", iso_code: "CA", iso_code_3: "CAN" })
    );

    // Seed region
    region = await RegionModel.create(
      buildRegionPayload({ name: "Ontario", code: "ON", country_id: testCountry._id })
    );
  });

  it("should fetch details of a region successfully", async () => {
    const result: any = await showRegionService.execute(region._id);

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.name).toBe("Ontario");
    expect(result.result.data[0].result.code).toBe("ON");
  });

  it("should return 404 when region does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const result: any = await showRegionService.execute(fakeId);

    expect(result.result.code).toBe(404);
    expect(result.result.success).toBe(false);
    expect(result.result.message).toContain("Region not found");
  });
});
