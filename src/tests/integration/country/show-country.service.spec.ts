import { describe, it, expect, beforeEach } from "@jest/globals";
import showCountryService from "@/resources/v1/masters/countries/services/show-country.service";
import CountryModel from "@/database/countries/countries-db-model";
import StatusModel from "@/database/status/status-db-model";
import { buildCountryPayload } from "../../factories/country.factory";
import mongoose from "mongoose";

describe("ShowCountryService (Integration)", () => {
  let country: any;

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

    country = await CountryModel.create(
      buildCountryPayload({ name: "Egypt", iso_code: "EG", iso_code_3: "EGY" })
    );
  });

  it("should fetch details of a country successfully", async () => {
    const result: any = await showCountryService.execute(country._id);

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);
    expect(result.result.data[0].result.name).toBe("Egypt");
    expect(result.result.data[0].result.iso_code).toBe("EG");
  });

  it("should return 404 when country does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const result: any = await showCountryService.execute(fakeId);

    expect(result.result.code).toBe(404);
    expect(result.result.success).toBe(false);
    expect(result.result.message).toContain("Country not found");
  });
});
