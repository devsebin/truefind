import mongoose from "mongoose";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import StatusModel from "@/database/status/status-db-model";
import EnablementPolicyModel from "@/database/enablement-policies/enablement-policies-db-model";
import enableCountryService from "@/resources/v1/masters/countries/services/enable-country.service";
import { registerCountryConditions } from "@/resources/v1/masters/countries/enablement/register-country-conditions";
import { PolicyStatus } from "@/core/enablement/types/policy";
import { policyResolver } from "@/core/enablement/policy/policy-resolver";

describe("Country Enablement Policy Integration", () => {
  let userId: mongoose.Types.ObjectId;
  let activeStatusId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    registerCountryConditions();
    userId = new mongoose.Types.ObjectId();

    const activeStatus = await StatusModel.create({
      title: "Active",
      label: "Active",
      color: "#00FF00",
      is_active: true,
      is_deleted: false,
    });
    activeStatusId = activeStatus._id as mongoose.Types.ObjectId;
  });

  afterEach(async () => {
    await CountryModel.deleteMany({});
    await RegionModel.deleteMany({});
    await EnablementPolicyModel.deleteMany({});
    policyResolver.invalidate();
  });

  it("should prevent country enablement when country violates active enablement policy and return failure reasons", async () => {
    // 1. Create Country with NO active regions
    const country = await CountryModel.create({
      name: "Testland",
      iso_code: "TL",
      iso_code_3: "TLS",
      phone_code: "+999",
      currency: "TLD",
      continent: "Europe",
      region_ids: [],
      is_active: false,
      is_deleted: false,
      status_id: activeStatusId,
    });

    // 2. Publish Country Policy requiring at least 1 active region
    await EnablementPolicyModel.create({
      entity_type: "COUNTRY",
      name: "Country Policy Requires Active Region",
      version: 1,
      status: PolicyStatus.PUBLISHED,
      rules: {
        kind: "CONDITION",
        type: "HAS_ACTIVE_REGION",
        params: { minimum: 1 },
      },
    });

    // 3. Try to enable country
    const result = await enableCountryService.execute(country._id, userId);

    expect(result.result.code).toBe(400);
    expect(result.result.success).toBe(false);
    const errData =
      (result as any).result.data?.[0]?.error?.details?.data ||
      (result as any).result.data?.[0]?.result?.data ||
      (result as any).result.data;
    expect(errData.failureReasons.length).toBeGreaterThan(0);
    expect(errData.failureReasons[0].code).toBe("HAS_ACTIVE_REGION");

    // Country should remain inactive in DB
    const checkCountry = await CountryModel.findOne({
      _id: country._id,
      is_active: { $in: [true, false] },
      is_deleted: { $in: [true, false] },
    });
    expect(checkCountry?.is_active).toBe(false);
  });

  it("should successfully enable country when active enablement policy is satisfied", async () => {
    // 1. Create active region
    const dummyCountryId = new mongoose.Types.ObjectId();
    const region = await RegionModel.create({
      name: "Central Region",
      code: "CRG",
      country_id: dummyCountryId,
      is_active: true,
      is_deleted: false,
      status_id: activeStatusId,
    });

    // 2. Create Country linked to active region
    const country = await CountryModel.create({
      _id: dummyCountryId,
      name: "Passland",
      iso_code: "PL",
      iso_code_3: "PLS",
      phone_code: "+998",
      currency: "PLD",
      continent: "Europe",
      region_ids: [region._id],
      is_active: false,
      is_deleted: false,
      status_id: activeStatusId,
    });

    // 3. Publish Country Policy requiring at least 1 active region
    await EnablementPolicyModel.create({
      entity_type: "COUNTRY",
      name: "Country Policy Requires Active Region",
      version: 1,
      status: PolicyStatus.PUBLISHED,
      rules: {
        kind: "CONDITION",
        type: "HAS_ACTIVE_REGION",
        params: { minimum: 1 },
      },
    });

    // 4. Enable country
    const result = await enableCountryService.execute(country._id, userId);

    expect(result.result.code).toBe(200);
    expect(result.result.success).toBe(true);

    const checkCountry = await CountryModel.findById(country._id);
    expect(checkCountry?.is_active).toBe(true);
  });
});
