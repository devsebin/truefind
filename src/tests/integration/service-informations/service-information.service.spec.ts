import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose, { Types } from "mongoose";
import { requestContext } from "@/utils/context/request-context";
import { BaseServiceModel, ServiceModel } from "@/database/services/services-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import ServiceInformationModel from "@/database/service-informations/service-information-db-model";

import createServiceInformationService from "@/resources/v1/masters/service-informations/services/create-service-information.service";
import showServiceInformationService from "@/resources/v1/masters/service-informations/services/show-service-information.service";
import listServiceInformationsService from "@/resources/v1/masters/service-informations/services/list-service-informations.service";
import updateServiceInformationService from "@/resources/v1/masters/service-informations/services/update-service-information.service";
import deleteServiceInformationService from "@/resources/v1/masters/service-informations/services/delete-service-information.service";
import enableServiceInformationService from "@/resources/v1/masters/service-informations/services/enable-service-information.service";
import disableServiceInformationService from "@/resources/v1/masters/service-informations/services/disable-service-information.service";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { buildServiceInformationPayload } from "@/tests/factories/service-information.factory";

describe("Service Information Master Service (Integration & Unit Tests)", () => {
  let testUser: any;
  let activeStatus: any;
  let defaultPriority: any;
  let testService: any;
  let testIcon: any;

  beforeAll(async () => {
    await BaseServiceModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await ServiceInformationModel.ensureIndexes();
  });

  beforeEach(async () => {
    await ServiceInformationModel.deleteMany({});
    await BaseServiceModel.deleteMany({});
    await UserModel.deleteMany({});
    await StatusModel.deleteMany({});
    await PriorityModel.deleteMany({});

    activeStatus = await StatusModel.create({
      title: "Active",
      label: "active",
      color: "#00FF00",
      is_default: true,
      is_active: true,
      is_deleted: false,
    });

    defaultPriority = await PriorityModel.create({
      title: "High",
      label: "High priority",
      color: "#ff0000",
      is_default: true,
      is_active: true,
      is_deleted: false,
      status_id: activeStatus._id,
    });

    testUser = await UserModel.create({
      first_name: "John",
      last_name: "Doe",
      email: "testuser@example.com",
      role: "super_admin",
      status_id: activeStatus._id,
      priority_id: defaultPriority._id,
    });

    testIcon = await DocumentModel.create({
      name: "icon.png",
      document_type: "image",
      content_type: "image/png",
      keys: { original: "test-key" },
      status_id: activeStatus._id,
    });

    testService = await ServiceModel.create({
      name: "Electrical Repair",
      description: "Electrical service description",
      type: serviceTypes.Service,
      icon: testIcon._id,
      status_id: activeStatus._id,
      is_active: true,
      is_deleted: false,
    });
  });

  describe("Create Service Information", () => {
    it("should create new service information successfully", async () => {
      const payload = buildServiceInformationPayload({
        service_id: testService._id.toString(),
      });

      const mockReq = {
        body: payload,
        user: { id: testUser._id.toString() },
      } as any;

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createServiceInformationService.execute(mockReq, payload);
      });

      expect(result.result.code).toBe(201);
      expect(result.result.success).toBe(true);
      expect(result.result.data.service.id.toString()).toBe(testService._id.toString());
      expect(result.result.data.how_it_works).toHaveLength(2);
      expect(result.result.data.included_items).toHaveLength(2);
      expect(result.result.data.insurance_coverage.enabled).toBe(true);
      expect(result.result.data.faqs).toHaveLength(2);
      expect(result.result.data.disclaimers).toHaveLength(1);

      const dbInfo = await ServiceInformationModel.findOne({ service_id: testService._id });
      expect(dbInfo).toBeDefined();
      expect(dbInfo!.how_it_works).toHaveLength(2);
    });

    it("should upsert existing service information when creating for the same service", async () => {
      const initialPayload = buildServiceInformationPayload({
        service_id: testService._id.toString(),
      });

      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        await createServiceInformationService.execute(
          { body: initialPayload, user: { id: testUser._id.toString() } } as any,
          initialPayload,
        );
      });

      const updatedPayload = buildServiceInformationPayload({
        service_id: testService._id.toString(),
        how_it_works: [
          {
            step: 1,
            title: "Updated step 1",
            description: "Updated description",
            sort_order: 1,
          },
        ],
      });

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createServiceInformationService.execute(
          { body: updatedPayload, user: { id: testUser._id.toString() } } as any,
          updatedPayload,
        );
      });

      expect(result.result.code).toBe(201);

      const allRecords = await ServiceInformationModel.find({ service_id: testService._id });
      expect(allRecords).toHaveLength(1);
      expect(allRecords[0].how_it_works).toHaveLength(1);
      expect(allRecords[0].how_it_works[0].title).toBe("Updated step 1");
    });

    it("should fail if service_id does not exist", async () => {
      const nonExistentServiceId = new Types.ObjectId().toString();
      const payload = buildServiceInformationPayload({
        service_id: nonExistentServiceId,
      });

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createServiceInformationService.execute(
          { body: payload, user: { id: testUser._id.toString() } } as any,
          payload,
        );
      });

      expect(result.result.code).toBe(404);
      expect(result.result.success).toBe(false);
      expect(result.result.message).toBe("Service not found.");
    });
  });

  describe("Show Service Information", () => {
    it("should retrieve service information by its _id", async () => {
      const payload = buildServiceInformationPayload({
        service_id: testService._id.toString(),
      });

      let createRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        createRes = await createServiceInformationService.execute(
          { body: payload, user: { id: testUser._id.toString() } } as any,
          payload,
        );
      });

      const infoId = new Types.ObjectId(createRes.result.data.id);
      const showRes: any = await showServiceInformationService.execute(infoId);

      expect(showRes.result.code).toBe(200);
      expect(showRes.result.success).toBe(true);
      expect(showRes.result.data.id.toString()).toBe(infoId.toString());
    });

    it("should retrieve service information by service_id", async () => {
      const payload = buildServiceInformationPayload({
        service_id: testService._id.toString(),
      });

      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        await createServiceInformationService.execute(
          { body: payload, user: { id: testUser._id.toString() } } as any,
          payload,
        );
      });

      const showRes: any = await showServiceInformationService.execute(testService._id);

      expect(showRes.result.code).toBe(200);
      expect(showRes.result.success).toBe(true);
      expect(showRes.result.data.service.id.toString()).toBe(testService._id.toString());
    });

    it("should return 404 if record is not found", async () => {
      const nonExistentId = new Types.ObjectId();
      const showRes: any = await showServiceInformationService.execute(nonExistentId);

      expect(showRes.result.code).toBe(404);
      expect(showRes.result.success).toBe(false);
    });
  });

  describe("List Service Informations", () => {
    it("should list service informations with filters", async () => {
      const payload = buildServiceInformationPayload({
        service_id: testService._id.toString(),
      });

      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        await createServiceInformationService.execute(
          { body: payload, user: { id: testUser._id.toString() } } as any,
          payload,
        );
      });

      const mockReq = {
        query: { service_id: testService._id.toString() },
      } as any;

      const listRes: any = await listServiceInformationsService.execute(mockReq);

      expect(listRes.result.code).toBe(200);
      expect(listRes.result.data).toHaveLength(1);
      expect(listRes.result.data[0].service.id.toString()).toBe(testService._id.toString());
    });
  });

  describe("Update Service Information", () => {
    it("should update service information fields", async () => {
      const payload = buildServiceInformationPayload({
        service_id: testService._id.toString(),
      });

      let createRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        createRes = await createServiceInformationService.execute(
          { body: payload, user: { id: testUser._id.toString() } } as any,
          payload,
        );
      });

      const infoId = new Types.ObjectId(createRes.result.data.id);
      const updatePayload = {
        how_it_works: [
          {
            step: 1,
            title: "New Title 1",
            description: "New Description 1",
            sort_order: 1,
          },
        ],
        faqs: [
          {
            question: "How long does it take?",
            answer: "Usually 1-2 hours.",
            sort_order: 1,
          },
        ],
      };

      let updateRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        updateRes = await updateServiceInformationService.execute(
          infoId,
          { body: updatePayload, user: { id: testUser._id.toString() } } as any,
          updatePayload,
        );
      });

      expect(updateRes.result.code).toBe(200);
      expect(updateRes.result.success).toBe(true);
      expect(updateRes.result.data.how_it_works).toHaveLength(1);
      expect(updateRes.result.data.how_it_works[0].title).toBe("New Title 1");
      expect(updateRes.result.data.faqs).toHaveLength(1);
    });

    it("should return 409 if no changes are detected", async () => {
      const payload = buildServiceInformationPayload({
        service_id: testService._id.toString(),
      });

      let createRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        createRes = await createServiceInformationService.execute(
          { body: payload, user: { id: testUser._id.toString() } } as any,
          payload,
        );
      });

      const infoId = new Types.ObjectId(createRes.result.data.id);

      let updateRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        updateRes = await updateServiceInformationService.execute(
          infoId,
          { body: {}, user: { id: testUser._id.toString() } } as any,
          {},
        );
      });

      expect(updateRes.result.code).toBe(409);
      expect(updateRes.result.message).toBe("No changes detected.");
    });
  });

  describe("Delete Service Information", () => {
    it("should soft delete service information", async () => {
      const payload = buildServiceInformationPayload({
        service_id: testService._id.toString(),
      });

      let createRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        createRes = await createServiceInformationService.execute(
          { body: payload, user: { id: testUser._id.toString() } } as any,
          payload,
        );
      });

      const infoId = new Types.ObjectId(createRes.result.data.id);

      let delRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        delRes = await deleteServiceInformationService.execute(infoId);
      });

      expect(delRes.result.code).toBe(200);
      expect(delRes.result.success).toBe(true);

      const dbInfo = await ServiceInformationModel.findById(infoId);
      expect(dbInfo!.is_deleted).toBe(true);
      expect(dbInfo!.is_active).toBe(false);
    });
  });

  describe("Enable & Disable Service Information", () => {
    it("should enable and disable service information successfully", async () => {
      const payload = buildServiceInformationPayload({
        service_id: testService._id.toString(),
      });

      let createRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        createRes = await createServiceInformationService.execute(
          { body: payload, user: { id: testUser._id.toString() } } as any,
          payload,
        );
      });

      const infoId = new Types.ObjectId(createRes.result.data.id);

      // Disable
      let disableRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        disableRes = await disableServiceInformationService.execute(infoId);
      });

      expect(disableRes.result.code).toBe(200);
      expect(disableRes.result.data.is_active).toBe(false);

      // Disable again -> conflict
      let disableAgainRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        disableAgainRes = await disableServiceInformationService.execute(infoId);
      });
      expect(disableAgainRes.result.code).toBe(409);

      // Enable
      let enableRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        enableRes = await enableServiceInformationService.execute(infoId);
      });

      expect(enableRes.result.code).toBe(200);
      expect(enableRes.result.data.is_active).toBe(true);

      // Enable again -> conflict
      let enableAgainRes: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        enableAgainRes = await enableServiceInformationService.execute(infoId);
      });
      expect(enableAgainRes.result.code).toBe(409);
    });
  });
});
