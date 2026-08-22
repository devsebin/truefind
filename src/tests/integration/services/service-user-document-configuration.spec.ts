import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import mongoose from "mongoose";
import { requestContext } from "@/utils/context/request-context";
import { BaseServiceModel, ServiceModel } from "@/database/services/services-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import serviceDocumentRequirementModel from "@/database/service-documents/service-documents-db-model";
import documentTypesModel from "@/database/document-types/document-types-db-model";
import ServiceDocumentConfigurationModel from "@/database/service-document-configuration/service-document-configuration-db-model";
import TaskUserMappingModel from "@/database/service-user-configuration/service-user-configuration-db-model";
import ServiceUserDocumentConfigurationsModel, {
  ServiceUserDocumentConfigurationStatus,
} from "@/database/service-user-document-configuration/service-user-document-configuration-db-model";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { timeUnits } from "@/database/services/services-db-interface";

import bulkStoreServiceUserConfigurationService from "@/resources/v1/service-user-configuration/services/bulk-store-service-user-configuration.service";
import createSingleServiceUserConfigurationService from "@/resources/v1/service-user-configuration/services/create-single-service-user-configuration.service";
import listServiceUserDocumentConfigurationService from "@/resources/v1/service-user-document-configuration/services/list-service-user-document-configuration.service";
import showServiceUserDocumentConfigurationService from "@/resources/v1/service-user-document-configuration/services/show-service-user-document-configuration.service";
import enableServiceUserDocumentConfigurationService from "@/resources/v1/service-user-document-configuration/services/enable-service-user-document-configuration.service";
import disableServiceUserDocumentConfigurationService from "@/resources/v1/service-user-document-configuration/services/disable-service-user-document-configuration.service";
import deleteServiceUserDocumentConfigurationService from "@/resources/v1/service-user-document-configuration/services/delete-service-user-document-configuration.service";

describe("Service User Document Configuration & Eligibility Integration", () => {
  let testUser: any;
  let adminUser: any;
  let testIcon: any;
  let activeStatus: any;
  let defaultPriority: any;
  let docType: any;
  let reqDoc1: any;
  let reqDoc2: any;
  let reqDoc3: any;
  let serviceA: any; // Requires 2 documents
  let serviceB: any; // Requires 0 documents
  let serviceC: any; // Requires 1 document

  beforeAll(async () => {
    await BaseServiceModel.ensureIndexes();
    await DocumentModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await serviceDocumentRequirementModel.ensureIndexes();
    await documentTypesModel.ensureIndexes();
    await ServiceDocumentConfigurationModel.ensureIndexes();
    await TaskUserMappingModel.ensureIndexes();
    await ServiceUserDocumentConfigurationsModel.ensureIndexes();
  });

  beforeEach(async () => {
    await ServiceUserDocumentConfigurationsModel.deleteMany({});
    await TaskUserMappingModel.deleteMany({});
    await ServiceDocumentConfigurationModel.deleteMany({});
    await serviceDocumentRequirementModel.deleteMany({});
    await documentTypesModel.deleteMany({});
    await BaseServiceModel.deleteMany({});
    await UserModel.deleteMany({});
    await DocumentModel.deleteMany({});
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
      first_name: "Regular",
      last_name: "User",
      email: "regular@example.com",
      role: "user",
      status_id: activeStatus._id,
      priority_id: defaultPriority._id,
    });

    adminUser = await UserModel.create({
      first_name: "Admin",
      last_name: "User",
      email: "admin@example.com",
      role: "admin",
      status_id: activeStatus._id,
      priority_id: defaultPriority._id,
    });

    testIcon = await DocumentModel.create({
      name: "service-icon.png",
      document_type: "image",
      content_type: "image/png",
      keys: { original: "test-key" },
      status_id: activeStatus._id,
    });

    docType = await documentTypesModel.create({
      title: "Identification",
      label: "id_proof",
      color: "#336699",
      is_default: true,
      status_id: activeStatus._id,
    });

    reqDoc1 = await serviceDocumentRequirementModel.create({
      name: "Aadhaar Card",
      display_name: "Aadhaar Card",
      item_code: "DOC_AADHAAR",
      document_type_id: docType._id,
      max_file_size: 5,
      accepted_mimeTypes: ["application/pdf", "image/jpeg"],
      is_active: true,
      is_deleted: false,
      status_id: activeStatus._id,
    });

    reqDoc2 = await serviceDocumentRequirementModel.create({
      name: "PAN Card",
      display_name: "PAN Card",
      item_code: "DOC_PAN",
      document_type_id: docType._id,
      max_file_size: 5,
      accepted_mimeTypes: ["application/pdf"],
      is_active: true,
      is_deleted: false,
      status_id: activeStatus._id,
    });

    reqDoc3 = await serviceDocumentRequirementModel.create({
      name: "Address Proof",
      display_name: "Address Proof",
      item_code: "DOC_ADDR",
      document_type_id: docType._id,
      max_file_size: 5,
      accepted_mimeTypes: ["application/pdf"],
      is_active: true,
      is_deleted: false,
      status_id: activeStatus._id,
    });

    serviceA = await ServiceModel.create({
      name: "Service A (Requires 2 docs)",
      type: serviceTypes.Service,
      description: "Service A description",
      icon: testIcon._id,
      estimated_time: 1,
      estimated_time_unit: timeUnits.hours,
      status_id: activeStatus._id,
      is_active: true,
      is_deleted: false,
    });

    serviceB = await ServiceModel.create({
      name: "Service B (Requires 0 docs)",
      type: serviceTypes.Service,
      description: "Service B description",
      icon: testIcon._id,
      estimated_time: 1,
      estimated_time_unit: timeUnits.hours,
      status_id: activeStatus._id,
      is_active: true,
      is_deleted: false,
    });

    serviceC = await ServiceModel.create({
      name: "Service C (Requires 1 doc)",
      type: serviceTypes.Service,
      description: "Service C description",
      icon: testIcon._id,
      estimated_time: 1,
      estimated_time_unit: timeUnits.hours,
      status_id: activeStatus._id,
      is_active: true,
      is_deleted: false,
    });

    // Configure Service A with 2 required docs
    await ServiceDocumentConfigurationModel.create({
      service_id: serviceA._id,
      required_documents: [
        {
          document_id: reqDoc1._id,
          is_mandatory: true,
          status_id: activeStatus._id,
        },
        {
          document_id: reqDoc2._id,
          is_mandatory: false,
          status_id: activeStatus._id,
        },
      ],
      status_id: activeStatus._id,
      is_active: true,
      is_deleted: false,
    });

    // Configure Service C with 1 required doc
    await ServiceDocumentConfigurationModel.create({
      service_id: serviceC._id,
      required_documents: [
        {
          document_id: reqDoc3._id,
          is_mandatory: true,
          status_id: activeStatus._id,
        },
      ],
      status_id: activeStatus._id,
      is_active: true,
      is_deleted: false,
    });
    // Service B has no ServiceDocumentConfiguration record
  });

  describe("Scenario 1 & 2 & 3: Single Service API Eligibility Processing", () => {
    it("Scenario 1: Single service requiring 1 document should set status to pending and create 1 user doc record", async () => {
      const payload = {
        service_id: serviceC._id.toString(),
      };

      const mockReq = {
        body: payload,
        user: testUser,
      } as any;

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createSingleServiceUserConfigurationService.execute(
          testUser._id.toString(),
          mockReq,
          payload,
        );
      });

      expect(result.result.code).toBe(201);
      expect(result.result.data[0].result.eligibility_status).toBe("pending");

      const userDocs = await ServiceUserDocumentConfigurationsModel.find({
        user_id: testUser._id,
        task_id: serviceC._id,
      });
      expect(userDocs.length).toBe(1);
      expect(userDocs[0].document_requirement_id.toString()).toBe(reqDoc3._id.toString());
      expect(userDocs[0].is_mandatory).toBe(true);
      expect(userDocs[0].current_status).toBe(ServiceUserDocumentConfigurationStatus.PENDING);
    });

    it("Scenario 2: Single service requiring multiple documents (2) should set status to pending and create 2 user doc records", async () => {
      const payload = {
        service_id: serviceA._id.toString(),
      };

      const mockReq = {
        body: payload,
        user: testUser,
      } as any;

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createSingleServiceUserConfigurationService.execute(
          testUser._id.toString(),
          mockReq,
          payload,
        );
      });

      expect(result.result.code).toBe(201);
      expect(result.result.data[0].result.eligibility_status).toBe("pending");

      const userDocs = await ServiceUserDocumentConfigurationsModel.find({
        user_id: testUser._id,
        task_id: serviceA._id,
      });
      expect(userDocs.length).toBe(2);
      const docRequirementIds = userDocs.map((d) => d.document_requirement_id.toString());
      expect(docRequirementIds).toContain(reqDoc1._id.toString());
      expect(docRequirementIds).toContain(reqDoc2._id.toString());
    });

    it("Scenario 3: Single service requiring no documents should set status to success and create 0 user doc records", async () => {
      const payload = {
        service_id: serviceB._id.toString(),
      };

      const mockReq = {
        body: payload,
        user: testUser,
      } as any;

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createSingleServiceUserConfigurationService.execute(
          testUser._id.toString(),
          mockReq,
          payload,
        );
      });

      expect(result.result.code).toBe(201);
      expect(result.result.data[0].result.eligibility_status).toBe("success");

      const userDocs = await ServiceUserDocumentConfigurationsModel.find({
        user_id: testUser._id,
        task_id: serviceB._id,
      });
      expect(userDocs.length).toBe(0);
    });

    it("Scenario 3b: Single service requiring only non-mandatory documents should set status to success but create user doc records", async () => {
      const nonMandatoryService = await ServiceModel.create({
        name: "Service Non-Mandatory",
        type: serviceTypes.Service,
        description: "Service with non mandatory docs",
        icon: testIcon._id,
        estimated_time: 1,
        estimated_time_unit: timeUnits.hours,
        status_id: activeStatus._id,
        is_active: true,
        is_deleted: false,
      });

      await ServiceDocumentConfigurationModel.create({
        service_id: nonMandatoryService._id,
        required_documents: [
          {
            document_id: reqDoc2._id, // is_mandatory: false
            is_mandatory: false,
            status_id: activeStatus._id,
          },
        ],
        status_id: activeStatus._id,
        is_active: true,
        is_deleted: false,
      });

      const payload = {
        service_id: nonMandatoryService._id.toString(),
      };

      const mockReq = {
        body: payload,
        user: testUser,
      } as any;

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await createSingleServiceUserConfigurationService.execute(
          testUser._id.toString(),
          mockReq,
          payload,
        );
      });

      expect(result.result.code).toBe(201);
      expect(result.result.data[0].result.eligibility_status).toBe("success");

      const userDocs = await ServiceUserDocumentConfigurationsModel.find({
        user_id: testUser._id,
        task_id: nonMandatoryService._id,
      });
      expect(userDocs.length).toBe(1);
      expect(userDocs[0].is_mandatory).toBe(false);
    });
  });

  describe("Scenario 4 & 5: Bulk Service API Mixed Services Eligibility Processing", () => {
    it("Scenario 4: Bulk request with mixed services (A: 2 docs -> pending, B: 0 docs -> success, C: 1 doc -> pending)", async () => {
      const payload = {
        service_ids: [
          serviceA._id.toString(),
          serviceB._id.toString(),
          serviceC._id.toString(),
        ],
      };

      const mockReq = {
        body: payload,
        user: testUser,
      } as any;

      let result: any;
      await requestContext.run({ userId: testUser._id.toString() }, async () => {
        result = await bulkStoreServiceUserConfigurationService.execute(
          testUser._id.toString(),
          mockReq,
          payload,
        );
      });

      expect(result.result.code).toBe(201);
      const items = result.result.data[0].result;
      expect(items.length).toBe(3);

      const mappingA = items.find((i: any) => (i.service_id?.toString() || i.service?.id?.toString() || i.task_id?.toString()) === serviceA._id.toString());
      const mappingB = items.find((i: any) => (i.service_id?.toString() || i.service?.id?.toString() || i.task_id?.toString()) === serviceB._id.toString());
      const mappingC = items.find((i: any) => (i.service_id?.toString() || i.service?.id?.toString() || i.task_id?.toString()) === serviceC._id.toString());

      expect(mappingA.eligibility_status).toBe("pending");
      expect(mappingB.eligibility_status).toBe("success");
      expect(mappingC.eligibility_status).toBe("pending");

      // Verify User Document Configuration records created
      const userDocsA = await ServiceUserDocumentConfigurationsModel.find({
        user_id: testUser._id,
        task_id: serviceA._id,
      });
      expect(userDocsA.length).toBe(2);

      const userDocsB = await ServiceUserDocumentConfigurationsModel.find({
        user_id: testUser._id,
        task_id: serviceB._id,
      });
      expect(userDocsB.length).toBe(0);

      const userDocsC = await ServiceUserDocumentConfigurationsModel.find({
        user_id: testUser._id,
        task_id: serviceC._id,
      });
      expect(userDocsC.length).toBe(1);
    });
  });

  describe("Service User Document Configuration Lifecycle (List, Show, Enable, Disable, Delete)", () => {
    let createdDocConfig: any;

    beforeEach(async () => {
      createdDocConfig = await ServiceUserDocumentConfigurationsModel.create({
        user_id: testUser._id,
        task_id: serviceA._id,
        document_requirement_id: reqDoc1._id,
        is_mandatory: true,
        uploads: [],
        current_status: ServiceUserDocumentConfigurationStatus.PENDING,
        is_active: true,
        is_deleted: false,
        status_id: activeStatus._id,
      });
    });

    it("should list service user document configurations", async () => {
      const mockReq = {
        query: { user_id: testUser._id.toString() },
        originalUrl: "/api/v1/service-user-document-configurations",
        method: "GET",
      } as any;

      const listResult: any =
        await listServiceUserDocumentConfigurationService.execute(mockReq);
      expect(listResult.result.code).toBe(200);
      expect(listResult.result.data[0].result.totalCount).toBe(1);
      expect(listResult.result.data[0].result.rows.length).toBe(1);
      expect(listResult.result.data[0].result.rows[0].document_requirement.name).toBe("Aadhaar Card");
    });

    it("should show service user document configuration details", async () => {
      const showResult: any =
        await showServiceUserDocumentConfigurationService.execute(
          createdDocConfig._id,
        );
      expect(showResult.result.code).toBe(200);
      expect(showResult.result.data[0].result.id.toString()).toBe(
        createdDocConfig._id.toString(),
      );
      expect(showResult.result.data[0].result.service.name).toBe(
        "Service A (Requires 2 docs)",
      );
    });

    it("should disable, enable, and soft delete service user document configuration", async () => {
      // Disable
      const disableResult: any =
        await disableServiceUserDocumentConfigurationService.execute(
          createdDocConfig._id,
          testUser._id,
        );
      expect(disableResult.result.code).toBe(200);
      let docInDb = await ServiceUserDocumentConfigurationsModel.findById(
        createdDocConfig._id,
      );
      expect(docInDb!.is_active).toBe(false);

      // Enable
      const enableResult: any =
        await enableServiceUserDocumentConfigurationService.execute(
          createdDocConfig._id,
          testUser._id,
        );
      expect(enableResult.result.code).toBe(200);
      docInDb = await ServiceUserDocumentConfigurationsModel.findById(
        createdDocConfig._id,
      );
      expect(docInDb!.is_active).toBe(true);

      // Delete
      const deleteResult: any =
        await deleteServiceUserDocumentConfigurationService.execute(
          createdDocConfig._id,
          testUser._id,
          true,
        );
      expect(deleteResult.result.code).toBe(200);
      docInDb = await ServiceUserDocumentConfigurationsModel.findById(
        createdDocConfig._id,
      );
      expect(docInDb!.is_deleted).toBe(true);
      expect(docInDb!.is_active).toBe(false);
    });
  });
});

