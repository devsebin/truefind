import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import {
  bundleServiceItemCreateSchema,
  bundleServiceItemUpdateSchema,
  bundleServiceItemToggleStatusSchema,
} from "@/resources/v1/bundle-service-items/bundle-service-items.validator";
import { toBundleServiceItemDTO } from "@/resources/v1/bundle-service-items/dto/bundle-service-item.dto";
import {
  bundleServiceItemResponse,
  bundleServiceItemListResponse,
} from "@/resources/v1/bundle-service-items/bundle-service-items.response";
import syncBundleStatusHelperService from "@/resources/v1/bundle-service-items/helpers/operations/sync-bundle-status.helper.service";
import BundleModel from "@/database/bundles/bundles-db-model";
import BundleServiceItemModel from "@/database/bundle-service-items/bundle-service-items-db-model";
import * as bundleStatusPlugin from "@/utils/plugins/bundle-status.plugin";

describe("Bundle Service Items Module (Unit Tests)", () => {
  const validBundleId = new mongoose.Types.ObjectId().toString();
  const validServiceId = new mongoose.Types.ObjectId().toString();

  describe("Validation Schemas", () => {
    describe("bundleServiceItemCreateSchema", () => {
      it("should pass for a valid payload", () => {
        const payload = {
          bundle_id: validBundleId,
          service_id: validServiceId,
          sort_order: 1,
          quantity: 2,
          is_mandatory: true,
          is_included: true,
          service_name_snapshot: "Test Service",
          service_code_snapshot: "TST-01",
        };

        const { error, value } = bundleServiceItemCreateSchema.validate(payload);
        expect(error).toBeUndefined();
        expect(value.bundle_id).toBe(validBundleId);
        expect(value.quantity).toBe(2);
      });

      it("should fail when bundle_id is missing", () => {
        const payload = {
          service_id: validServiceId,
        };

        const { error } = bundleServiceItemCreateSchema.validate(payload);
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain("bundle_id is required");
      });

      it("should fail when service_id is invalid ObjectId", () => {
        const payload = {
          bundle_id: validBundleId,
          service_id: "not-a-valid-id",
        };

        const { error } = bundleServiceItemCreateSchema.validate(payload);
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain("valid MongoDB ObjectId");
      });

      it("should fail when quantity is less than 1", () => {
        const payload = {
          bundle_id: validBundleId,
          service_id: validServiceId,
          quantity: 0,
        };

        const { error } = bundleServiceItemCreateSchema.validate(payload);
        expect(error).toBeDefined();
      });
    });

    describe("bundleServiceItemUpdateSchema", () => {
      it("should pass with partial valid fields", () => {
        const payload = {
          sort_order: 5,
          quantity: 3,
          is_mandatory: false,
        };

        const { error, value } = bundleServiceItemUpdateSchema.validate(payload);
        expect(error).toBeUndefined();
        expect(value.sort_order).toBe(5);
      });

      it("should fail when invalid ObjectId is provided for bundle_id", () => {
        const payload = {
          bundle_id: "invalid_id",
        };

        const { error } = bundleServiceItemUpdateSchema.validate(payload);
        expect(error).toBeDefined();
        expect(error?.details[0].message).toContain("valid MongoDB ObjectId");
      });
    });

    describe("bundleServiceItemToggleStatusSchema", () => {
      it("should pass when is_active is boolean", () => {
        const { error, value } = bundleServiceItemToggleStatusSchema.validate({
          is_active: false,
        });
        expect(error).toBeUndefined();
        expect(value.is_active).toBe(false);
      });

      it("should fail when is_active is missing", () => {
        const { error } = bundleServiceItemToggleStatusSchema.validate({});
        expect(error).toBeDefined();
      });
    });
  });

  describe("DTO Conversion (toBundleServiceItemDTO)", () => {
    it("should transform raw body to proper DTO types", () => {
      const raw = {
        bundle_id: validBundleId,
        service_id: validServiceId,
        sort_order: "2",
        quantity: "3",
        is_mandatory: "true",
        is_included: "true",
        is_active: "true",
      };

      const dto = toBundleServiceItemDTO(raw);
      expect(dto.bundle_id).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(dto.service_id).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(dto.sort_order).toBe(2);
      expect(dto.quantity).toBe(3);
      expect(dto.is_mandatory).toBe(true);
      expect(dto.is_included).toBe(true);
      expect(dto.is_active).toBe(true);
    });
  });

  describe("Response Transformers", () => {
    it("bundleServiceItemResponse should correctly structure item object", () => {
      const mockDoc = {
        _id: new mongoose.Types.ObjectId(validBundleId),
        bundle_id: {
          _id: new mongoose.Types.ObjectId(validBundleId),
          name: "Bundle 1",
          display_name: "Bundle One",
          code: "BND-1",
          description: "Desc",
          status_id: {
            _id: new mongoose.Types.ObjectId(),
            title: "Active",
            label: "active",
            color: "#00FF00",
            is_default: false,
          },
          is_active: true,
        },
        service_id: {
          _id: new mongoose.Types.ObjectId(validServiceId),
          name: "Service A",
          code: "SRV-A",
          description: "Service Desc",
          is_active: true,
          is_deleted: false,
        },
        sort_order: 1,
        quantity: 2,
        is_mandatory: true,
        is_included: true,
        service_name_snapshot: "Service A",
        service_code_snapshot: "SRV-A",
        metadata: {},
        is_active: true,
        is_deleted: false,
        created_by: {
          _id: new mongoose.Types.ObjectId(),
          first_name: "John",
          last_name: "Doe",
          email: "john@example.com",
          role: "admin",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const res = bundleServiceItemResponse(mockDoc);
      expect(res.id.toString()).toBe(validBundleId);
      expect(res.bundle.name).toBe("Bundle 1");
      expect(res.service.name).toBe("Service A");
      expect(res.quantity).toBe(2);
      expect(res.created_by.first_name).toBe("John");
    });

    it("bundleServiceItemListResponse should map array", () => {
      const list = bundleServiceItemListResponse([null]);
      expect(list).toEqual([null]);
    });
  });

  describe("Sync Bundle Status Logic (syncBundleStatusHelperService)", () => {
    const activeStatusId = new mongoose.Types.ObjectId();
    const draftStatusId = new mongoose.Types.ObjectId();

    beforeEach(() => {
      jest.clearAllMocks();
      jest
        .spyOn(bundleStatusPlugin, "getActiveBundleStatusId")
        .mockResolvedValue(activeStatusId as any);
      jest
        .spyOn(bundleStatusPlugin, "getDefaultBundleStatusId")
        .mockResolvedValue(draftStatusId as any);
    });

    it("should set bundle status to Active and is_active = true when services exist and are active", async () => {
      const mockBundleObj: any = {
        _id: new mongoose.Types.ObjectId(validBundleId),
        status_id: draftStatusId,
        is_active: false,
      };
      mockBundleObj.toObject = () => ({ ...mockBundleObj });
      mockBundleObj.save = jest.fn<any>().mockImplementation(async () => mockBundleObj);

      jest.spyOn(BundleModel, "findOne").mockReturnValue({
        session: jest.fn<any>().mockResolvedValue(mockBundleObj),
      } as any);

      jest.spyOn(BundleServiceItemModel, "countDocuments").mockReturnValue({
        session: jest.fn<any>().mockResolvedValue(2), // 2 active services
      } as any);

      const fakeSession: any = {};
      await syncBundleStatusHelperService.execute(
        new mongoose.Types.ObjectId(validBundleId),
        fakeSession,
      );

      expect(mockBundleObj.status_id).toBe(activeStatusId);
      expect(mockBundleObj.is_active).toBe(true);
      expect(mockBundleObj.save).toHaveBeenCalled();
    });

    it("should set bundle status to Draft and is_active = false when all services are inactive or deleted", async () => {
      const mockBundleObj: any = {
        _id: new mongoose.Types.ObjectId(validBundleId),
        status_id: activeStatusId,
        is_active: true,
      };
      mockBundleObj.toObject = () => ({ ...mockBundleObj });
      mockBundleObj.save = jest.fn<any>().mockImplementation(async () => mockBundleObj);

      jest.spyOn(BundleModel, "findOne").mockReturnValue({
        session: jest.fn<any>().mockResolvedValue(mockBundleObj),
      } as any);

      jest.spyOn(BundleServiceItemModel, "countDocuments").mockReturnValue({
        session: jest.fn<any>().mockResolvedValue(0), // 0 active services
      } as any);

      const fakeSession: any = {};
      await syncBundleStatusHelperService.execute(
        new mongoose.Types.ObjectId(validBundleId),
        fakeSession,
      );

      expect(mockBundleObj.status_id).toBe(draftStatusId);
      expect(mockBundleObj.is_active).toBe(false);
      expect(mockBundleObj.save).toHaveBeenCalled();
    });
  });
});
