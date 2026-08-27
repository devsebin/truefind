import { describe, it, expect } from "@jest/globals";
import mongoose from "mongoose";
import {
  bundleCountryConfigCreateSchema,
  bundleCountryConfigUpdateSchema,
} from "@/resources/v1/bundle-country-configurations/bundle-country-configurations.validator";
import { toBundleCountryConfigurationDTO } from "@/resources/v1/bundle-country-configurations/dto/bundle-country-configuration.dto";
import {
  bundleCountryConfigResponse,
  bundleCountryConfigListResponse,
} from "@/resources/v1/bundle-country-configurations/bundle-country-configurations.response";
import { timeUnits } from "@/database/services/services-db-interface";

describe("Bundle Country Configurations Validator & Helpers (Unit Tests)", () => {
  const validBundleId = new mongoose.Types.ObjectId().toString();
  const validCountryId = new mongoose.Types.ObjectId().toString();
  const validCurrencyId = new mongoose.Types.ObjectId().toString();
  const validUnitId = new mongoose.Types.ObjectId().toString();

  describe("Create Schema Validation (bundleCountryConfigCreateSchema)", () => {
    it("should pass validation for a valid fixed price bundle", () => {
      const payload = {
        bundle_id: validBundleId,
        country_id: validCountryId,
        currency_id: validCurrencyId,
        is_callout_bundle: false,
        is_fixed_price: true,
        price: 1500,
        unit_id: validUnitId,
        estimated_time: 3,
        estimated_time_unit: timeUnits.hours,
        individual_services_total: 2000,
        bundle_discount_type: "FIXED",
        bundle_discount_value: 500,
      };

      const { error, value } = bundleCountryConfigCreateSchema.validate(payload);
      expect(error).toBeUndefined();
      expect(value.price).toBe(1500);
    });

    it("should pass validation for a valid callout bundle with price ranges", () => {
      const payload = {
        bundle_id: validBundleId,
        country_id: validCountryId,
        currency_id: validCurrencyId,
        is_callout_bundle: true,
        is_fixed_price: false,
        call_out_fee: 250,
        minimum_price: 500,
        maximum_price: 3000,
      };

      const { error } = bundleCountryConfigCreateSchema.validate(payload);
      expect(error).toBeUndefined();
    });

    it("should fail validation when required fields are missing", () => {
      const payload = {
        bundle_id: validBundleId,
      };

      const { error } = bundleCountryConfigCreateSchema.validate(payload);
      expect(error).toBeDefined();
    });

    it("should fail validation for invalid MongoDB ObjectId in bundle_id", () => {
      const payload = {
        bundle_id: "invalid-id",
        country_id: validCountryId,
        currency_id: validCurrencyId,
        is_callout_bundle: false,
        is_fixed_price: true,
        price: 100,
      };

      const { error } = bundleCountryConfigCreateSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("valid MongoDB ObjectId");
    });

    it("should forbid call_out_fee when is_callout_bundle is false", () => {
      const payload = {
        bundle_id: validBundleId,
        country_id: validCountryId,
        currency_id: validCurrencyId,
        is_callout_bundle: false,
        is_fixed_price: true,
        price: 100,
        call_out_fee: 50,
      };

      const { error } = bundleCountryConfigCreateSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("call_out_fee is not allowed when is_callout_bundle is false");
    });

    it("should require call_out_fee when is_callout_bundle is true", () => {
      const payload = {
        bundle_id: validBundleId,
        country_id: validCountryId,
        currency_id: validCurrencyId,
        is_callout_bundle: true,
        is_fixed_price: false,
        minimum_price: 100,
        maximum_price: 500,
      };

      const { error } = bundleCountryConfigCreateSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("call_out_fee is required when is_callout_bundle is true");
    });

    it("should force is_fixed_price to be false when is_callout_bundle is true", () => {
      const payload = {
        bundle_id: validBundleId,
        country_id: validCountryId,
        currency_id: validCurrencyId,
        is_callout_bundle: true,
        is_fixed_price: true,
        call_out_fee: 50,
        minimum_price: 100,
        maximum_price: 500,
      };

      const { error } = bundleCountryConfigCreateSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("is_fixed_price must be false when is_callout_bundle is true");
    });

    it("should require price when is_fixed_price is true", () => {
      const payload = {
        bundle_id: validBundleId,
        country_id: validCountryId,
        currency_id: validCurrencyId,
        is_callout_bundle: false,
        is_fixed_price: true,
      };

      const { error } = bundleCountryConfigCreateSchema.validate(payload);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("price is required when is_fixed_price is true");
    });

    it("should require minimum_price & maximum_price when is_callout_bundle is true", () => {
      const payload = {
        bundle_id: validBundleId,
        country_id: validCountryId,
        currency_id: validCurrencyId,
        is_callout_bundle: true,
        is_fixed_price: false,
        call_out_fee: 100,
      };

      const { error } = bundleCountryConfigCreateSchema.validate(payload);
      expect(error).toBeDefined();
    });
  });

  describe("Update Schema Validation (bundleCountryConfigUpdateSchema)", () => {
    it("should pass for partial update payload", () => {
      const updatePayload = {
        is_fixed_price: true,
        price: 1800,
        bundle_discount_value: 400,
      };

      const { error } = bundleCountryConfigUpdateSchema.validate(updatePayload);
      expect(error).toBeUndefined();
    });

    it("should validate callout bundle update constraints", () => {
      const updatePayload = {
        is_callout_bundle: true,
        call_out_fee: 150,
        minimum_price: 300,
        maximum_price: 2000,
        is_fixed_price: false,
      };

      const { error } = bundleCountryConfigUpdateSchema.validate(updatePayload);
      expect(error).toBeUndefined();
    });
  });

  describe("DTO Conversion (toBundleCountryConfigurationDTO)", () => {
    it("should correctly cast strings to ObjectIds and numbers", () => {
      const rawInput = {
        bundle_id: validBundleId,
        country_id: validCountryId,
        currency_id: validCurrencyId,
        unit_id: validUnitId,
        is_callout_bundle: false,
        is_fixed_price: true,
        price: "1250",
        minimum_price: "500",
        maximum_price: "2500",
        call_out_fee: "100",
        estimated_time: "4",
        estimated_time_unit: "hours",
        individual_services_total: "1500",
        bundle_discount_type: "FIXED",
        bundle_discount_value: "250",
        is_active: true,
      };

      const dto = toBundleCountryConfigurationDTO(rawInput);
      expect(dto.bundle_id).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(dto.country_id).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(dto.currency_id).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(dto.unit_id).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(dto.price).toBe(1250);
      expect(dto.minimum_price).toBe(500);
      expect(dto.maximum_price).toBe(2500);
      expect(dto.call_out_fee).toBe(100);
      expect(dto.estimated_time).toBe(4);
      expect(dto.bundle_discount_value).toBe(250);
      expect(dto.is_active).toBe(true);
    });

    it("should handle optional fields as undefined when not present", () => {
      const rawInput = {
        bundle_id: validBundleId,
        country_id: validCountryId,
        currency_id: validCurrencyId,
      };

      const dto = toBundleCountryConfigurationDTO(rawInput);
      expect(dto.unit_id).toBeUndefined();
      expect(dto.price).toBeUndefined();
      expect(dto.is_callout_bundle).toBe(false);
      expect(dto.is_fixed_price).toBe(false);
    });
  });

  describe("Response Formatter (bundleCountryConfigResponse)", () => {
    it("should format config document correctly into response object", () => {
      const mockDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        bundle_id: {
          _id: new mongoose.Types.ObjectId(),
          name: "Deep Cleaning Bundle",
          code: "DC_01",
          description: "All in one cleaning",
          is_active: true,
          estimated_time: 2,
          estimated_time_unit: "hours",
        },
        country_id: {
          _id: new mongoose.Types.ObjectId(),
          name: "India",
          iso_code: "IN",
          iso_code_3: "IND",
          providers: [],
        },
        currency_id: {
          _id: new mongoose.Types.ObjectId(),
          title: "Indian Rupee",
          label: "inr",
          code: "INR",
        },
        unit_id: {
          _id: new mongoose.Types.ObjectId(),
          title: "Hour",
          label: "hr",
          dimension: "time",
          color: "#000",
        },
        status_id: {
          _id: new mongoose.Types.ObjectId(),
          title: "Active",
          label: "active",
          color: "#00FF00",
          is_default: true,
        },
        is_callout_bundle: false,
        is_fixed_price: true,
        price: 2000,
        minimum_price: undefined,
        maximum_price: undefined,
        call_out_fee: undefined,
        estimated_time: 2,
        estimated_time_unit: "hours",
        individual_services_total: 2500,
        bundle_discount_type: "PERCENTAGE",
        bundle_discount_value: 20,
        is_active: true,
        is_deleted: false,
        created_by: {
          _id: new mongoose.Types.ObjectId(),
          first_name: "Admin",
          last_name: "User",
          email: "admin@example.com",
          role: "super_admin",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const res = bundleCountryConfigResponse(mockDoc);
      expect(res.id).toEqual(mockDoc._id);
      expect(res.bundle.name).toBe("Deep Cleaning Bundle");
      expect(res.country.name).toBe("India");
      expect(res.currency.code).toBe("INR");
      expect(res.unit.label).toBe("hr");
      expect(res.status.title).toBe("Active");
      expect(res.price).toBe(2000);
      expect(res.created_by.email).toBe("admin@example.com");
    });

    it("should format list response correctly", () => {
      const list = bundleCountryConfigListResponse([
        {
          _id: new mongoose.Types.ObjectId(),
          price: 500,
        },
      ]);
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(1);
    });

    it("should return null if config is null", () => {
      expect(bundleCountryConfigResponse(null)).toBeNull();
    });
  });
});
