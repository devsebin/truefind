import { HasActiveRegionCondition } from "@/resources/v1/masters/countries/enablement/conditions/has-active-region.condition";
import { HasSmsProviderCondition } from "@/resources/v1/masters/countries/enablement/conditions/has-sms-provider.condition";
import { HasConfigurationCondition } from "@/resources/v1/masters/countries/enablement/conditions/has-configuration.condition";
import RegionModel from "@/database/regions/regions-db-model";
import ProviderModel from "@/database/providers/providers-db-model";
import mongoose from "mongoose";

jest.mock("@/database/regions/regions-db-model");
jest.mock("@/database/providers/providers-db-model");

describe("Country Conditions Unit Tests", () => {
  describe("HasActiveRegionCondition", () => {
    const condition = new HasActiveRegionCondition();

    it("should pass when region count satisfies minimum", async () => {
      (RegionModel.countDocuments as jest.Mock).mockResolvedValue(2);

      const mockCountry: any = {
        region_ids: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      };

      const res = await condition.evaluate(mockCountry, { minimum: 1 });
      expect(res.passed).toBe(true);
      expect(res.metadata?.actual).toBe(2);
    });

    it("should fail when region count is less than minimum", async () => {
      (RegionModel.countDocuments as jest.Mock).mockResolvedValue(0);

      const mockCountry: any = {
        region_ids: [],
      };

      const res = await condition.evaluate(mockCountry, { minimum: 1 });
      expect(res.passed).toBe(false);
      expect(res.metadata?.actual).toBe(0);
    });
  });

  describe("HasSmsProviderCondition", () => {
    const condition = new HasSmsProviderCondition();

    it("should pass when verified SMS provider exists", async () => {
      (ProviderModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const mockCountry: any = {
        providers: [
          {
            provider_id: new mongoose.Types.ObjectId(),
            is_default: true,
            is_tested: true,
          },
        ],
      };

      const res = await condition.evaluate(mockCountry, { minimum: 1, requireTested: true });
      expect(res.passed).toBe(true);
      expect(res.metadata?.actual).toBe(1);
    });

    it("should fail when provider is not tested and requireTested is true", async () => {
      const mockCountry: any = {
        providers: [
          {
            provider_id: new mongoose.Types.ObjectId(),
            is_default: true,
            is_tested: false,
          },
        ],
      };

      const res = await condition.evaluate(mockCountry, { minimum: 1, requireTested: true });
      expect(res.passed).toBe(false);
      expect(res.metadata?.actual).toBe(0);
    });
  });

  describe("HasConfigurationCondition", () => {
    const condition = new HasConfigurationCondition();

    it("should pass when country has currency, phone_code, and continent", async () => {
      const mockCountry: any = {
        currency: "USD",
        phone_code: "+1",
        continent: "North America",
      };

      const res = await condition.evaluate(mockCountry);
      expect(res.passed).toBe(true);
    });

    it("should fail when country lacks currency", async () => {
      const mockCountry: any = {
        currency: "",
        phone_code: "+1",
        continent: "North America",
      };

      const res = await condition.evaluate(mockCountry);
      expect(res.passed).toBe(false);
      expect(res.metadata?.missingFields).toContain("currency");
    });
  });
});
