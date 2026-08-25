import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose, { Types } from "mongoose";
import { requestContext } from "@/utils/context/request-context";
import { BaseServiceModel, ServiceModel } from "@/database/services/services-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import documentTypesModel from "@/database/document-types/document-types-db-model";
import ServiceDocumentConfigurationModel from "@/database/service-document-configuration/service-document-configuration-db-model";

import createServiceDocumentConfigurationService from "@/resources/v1/service-document-configurations/services/create-service-document-configuration.service";
import showServiceDocumentConfigurationService from "@/resources/v1/service-document-configurations/services/show-service-document-configuration.service";
import listServiceDocumentConfigurationsService from "@/resources/v1/service-document-configurations/services/list-service-document-configurations.service";
import updateServiceDocumentConfigurationService from "@/resources/v1/service-document-configurations/services/update-service-document-configuration.service";
import deleteServiceDocumentConfigurationService from "@/resources/v1/service-document-configurations/services/delete-service-document-configuration.service";
import enableServiceDocumentConfigurationService from "@/resources/v1/service-document-configurations/services/enable-service-document-configuration.service";
import disableServiceDocumentConfigurationService from "@/resources/v1/service-document-configurations/services/disable-service-document-configuration.service";
import { serviceTypes } from "@/utils/definitions/constants/service-types";

describe("Service Document Configuration Master Service (Integration)", () => {
  let testUser: any;
  let activeStatus: any;
  let defaultPriority: any;
  let docType: any;
  let testService: any;
  let doc1: any;
  let doc2: any;
  let doc3: any;

  beforeAll(async () => {
    await BaseServiceModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await serviceDocumentRequirementModel.ensureIndexes();
    await documentTypesModel.ensureIndexes();
    await ServiceDocumentConfigurationModel.ensureIndexes();
  });

  beforeEach(async () => {
    await ServiceDocumentConfigurationModel.deleteMany({});
    await serviceDocumentRequirementModel.deleteMany({});
    await documentTypesModel.deleteMany({});
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

    docType = await documentTypesModel.create({
      title: "Identification",
      label: "id_proof",
      color: "#336699",
      is_default: true,
      status_id: activeStatus._id,
    });

    doc1 = await serviceDocumentRequirementModel.create({
      name: "Driver License",
      display_name: "Driver's License",
      item_code: "DOC_DL_01",
      document_type_id: docType._id,
      max_file_size: 5,
      accepted_mimeTypes: ["application/pdf", "image/jpeg"],
      is_active: true,
      is_deleted: false,
      status_id: activeStatus._id,
    });

    doc2 = await serviceDocumentRequirementModel.create({
      name: "Passport",
      display_name: "Passport Document",
      item_code: "DOC_PASS_01",
      document_type_id: docType._id,
      max_file_size: 5,
      accepted_mimeTypes: ["application/pdf"],
      is_active: true,
      is_deleted: false,
      status_id: activeStatus._id,
    });

    doc3 = await serviceDocumentRequirementModel.create({
      name: "Trade Certificate",
      display_name: "Trade License / Cert",
      item_code: "DOC_TRADE_01",
      document_type_id: docType._id,
      max_file_size: 10,
      accepted_mimeTypes: ["application/pdf"],
      is_active: true,
      is_deleted: false,
      status_id: activeStatus._id,
    });

    const testIcon = await DocumentModel.create({
      name: "icon.png",
      document_type: "image",
      content_type: "image/png",
      keys: { original: "test-key" },
      status_id: activeStatus._id,
    });

    testService = await ServiceModel.create({
      name: "Plumbing Repair",
      description: "Plumbing service description",
      type: serviceTypes.Service,
      icon: testIcon._id,
      status_id: activeStatus._id,
      is_active: true,
      is_deleted: false,
    });
  });

  describe("Create Service Document Configuration", () => {
    it("should create a new configuration with required and exemption documents", async () => {
      const payload = {
        service_id: testService._id.toString(),
        required_documents: [
          {
            document_id: doc1._id.toString(),
            is_mandatory: true,
            exemption_documents: [
              {
                document_id: doc2._id.toString(),
                condition: "valid",
              },
            ],
          },
          {
            document_id: doc3._id.toString(),
            is_mandatory: false,
            exemption_documents: [],
          },
        ],
      };

      const mockReq = {
        body: payload,
        user: { id: testUser._id.toString() },
      } as any;

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createServiceDocumentConfigurationService.execute(mockReq, payload);
      });

      expect(result.result.code).toBe(201);
      expect(result.result.success).toBe(true);

      const dbConfig = await ServiceDocumentConfigurationModel.findOne({
        service_id: testService._id,
      });
      expect(dbConfig).toBeDefined();
      expect(dbConfig!.required_documents).toHaveLength(2);
      expect(dbConfig!.required_documents[0].document_id.toString()).toBe(doc1._id.toString());
      expect(dbConfig!.required_documents[0].exemption_documents![0].document_id.toString()).toBe(
        doc2._id.toString(),
      );
    });

    it("should upsert existing configuration if created again for the same service", async () => {
      const initialPayload = {
        service_id: testService._id.toString(),
        required_documents: [
          {
            document_id: doc1._id.toString(),
            is_mandatory: true,
          },
        ],
      };

      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        await createServiceDocumentConfigurationService.execute(
          { body: initialPayload, user: { id: testUser._id.toString() } } as any,
          initialPayload,
        );
      });

      const updatedPayload = {
        service_id: testService._id.toString(),
        required_documents: [
          {
            document_id: doc2._id.toString(),
            is_mandatory: false,
          },
        ],
      };

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createServiceDocumentConfigurationService.execute(
          { body: updatedPayload, user: { id: testUser._id.toString() } } as any,
          updatedPayload,
        );
      });

      expect(result.result.code).toBe(201);
      const allConfigs = await ServiceDocumentConfigurationModel.find({
        service_id: testService._id,
      });
      expect(allConfigs).toHaveLength(1);
      expect(allConfigs[0].required_documents[0].document_id.toString()).toBe(doc2._id.toString());
    });

    it("should fail if service does not exist", async () => {
      const nonExistentServiceId = new Types.ObjectId().toString();
      const payload = {
        service_id: nonExistentServiceId,
        required_documents: [
          {
            document_id: doc1._id.toString(),
            is_mandatory: true,
          },
        ],
      };

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createServiceDocumentConfigurationService.execute(
          { body: payload, user: { id: testUser._id.toString() } } as any,
          payload,
        );
      });

      expect(result.result.code).toBe(404);
    });

    it("should fail if document_id does not exist", async () => {
      const nonExistentDocId = new Types.ObjectId().toString();
      const payload = {
        service_id: testService._id.toString(),
        required_documents: [
          {
            document_id: nonExistentDocId,
            is_mandatory: true,
          },
        ],
      };

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createServiceDocumentConfigurationService.execute(
          { body: payload, user: { id: testUser._id.toString() } } as any,
          payload,
        );
      });

      expect(result.result.code).toBe(404);
    });

    it("should fail if required document exempts itself", async () => {
      const payload = {
        service_id: testService._id.toString(),
        required_documents: [
          {
            document_id: doc1._id.toString(),
            is_mandatory: true,
            exemption_documents: [
              {
                document_id: doc1._id.toString(),
                condition: "valid",
              },
            ],
          },
        ],
      };

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createServiceDocumentConfigurationService.execute(
          { body: payload, user: { id: testUser._id.toString() } } as any,
          payload,
        );
      });

      expect(result.result.code).toBe(400);
    });
  });

  describe("Show & List Service Document Configuration", () => {
    let createdConfig: any;

    beforeEach(async () => {
      createdConfig = await ServiceDocumentConfigurationModel.create({
        service_id: testService._id,
        required_documents: [
          {
            document_id: doc1._id,
            is_mandatory: true,
            exemption_documents: [],
            status_id: activeStatus._id,
          },
        ],
        status_id: activeStatus._id,
        is_active: true,
        is_deleted: false,
      });
    });

    it("should show configuration by config ID", async () => {
      const result: any = await showServiceDocumentConfigurationService.execute(
        createdConfig._id,
      );

      expect(result.result.code).toBe(200);
      expect(result.result.data[0].result.id.toString()).toBe(createdConfig._id.toString());
    });

    it("should show configuration by service ID", async () => {
      const result: any = await showServiceDocumentConfigurationService.execute(
        testService._id,
      );

      expect(result.result.code).toBe(200);
      expect(result.result.data[0].result.service.id.toString()).toBe(testService._id.toString());
    });

    it("should list configurations", async () => {
      const mockReq = { query: {} } as any;
      const result: any = await listServiceDocumentConfigurationsService.execute(mockReq);

      expect(result.result.code).toBe(200);
      expect(result.result.data[0].result).toHaveLength(1);
    });
  });

  describe("Update, Enable, Disable, Delete Lifecycle", () => {
    let createdConfig: any;

    beforeEach(async () => {
      createdConfig = await ServiceDocumentConfigurationModel.create({
        service_id: testService._id,
        required_documents: [
          {
            document_id: doc1._id,
            is_mandatory: true,
            exemption_documents: [],
            status_id: activeStatus._id,
          },
        ],
        status_id: activeStatus._id,
        is_active: true,
        is_deleted: false,
      });
    });

    it("should update required documents", async () => {
      const updatePayload = {
        required_documents: [
          {
            document_id: doc2._id.toString(),
            is_mandatory: false,
            exemption_documents: [],
          },
        ],
      };

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await updateServiceDocumentConfigurationService.execute(
          createdConfig._id,
          { body: updatePayload, user: { id: testUser._id.toString() } } as any,
          updatePayload,
        );
      });

      expect(result.result.code).toBe(200);
      const updatedInDb = await ServiceDocumentConfigurationModel.findById(createdConfig._id);
      expect(updatedInDb!.required_documents[0].document_id.toString()).toBe(doc2._id.toString());
    });

    it("should disable configuration", async () => {
      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await disableServiceDocumentConfigurationService.execute(createdConfig._id);
      });

      expect(result.result.code).toBe(200);
      const updatedInDb = await ServiceDocumentConfigurationModel.findById(createdConfig._id);
      expect(updatedInDb!.is_active).toBe(false);
    });

    it("should enable disabled configuration", async () => {
      createdConfig.is_active = false;
      await createdConfig.save();

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await enableServiceDocumentConfigurationService.execute(createdConfig._id);
      });

      expect(result.result.code).toBe(200);
      const updatedInDb = await ServiceDocumentConfigurationModel.findById(createdConfig._id);
      expect(updatedInDb!.is_active).toBe(true);
    });

    it("should soft delete configuration", async () => {
      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await deleteServiceDocumentConfigurationService.execute(createdConfig._id);
      });

      expect(result.result.code).toBe(200);
      const updatedInDb = await ServiceDocumentConfigurationModel.findById(createdConfig._id);
      expect(updatedInDb!.is_deleted).toBe(true);
    });
  });
});
