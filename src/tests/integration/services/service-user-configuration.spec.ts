import { describe, it, expect, beforeEach, beforeAll } from "@jest/globals";
import mongoose from "mongoose";
import { requestContext } from "@/utils/context/request-context";
import { BaseServiceModel, ServiceModel } from "@/database/services/services-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import TaskUserMappingModel from "@/database/service-user-configuration/service-user-configuration-db-model";
import { serviceTypes } from "@/utils/definitions/constants/service-types";
import { timeUnits } from "@/database/services/services-db-interface";

import bulkStoreServiceUserConfigurationService from "@/resources/v1/service-user-configuration/services/bulk-store-service-user-configuration.service";
import createSingleServiceUserConfigurationService from "@/resources/v1/service-user-configuration/services/create-single-service-user-configuration.service";
import listServiceUserConfigurationService from "@/resources/v1/service-user-configuration/services/list-service-user-configuration.service";
import showServiceUserConfigurationService from "@/resources/v1/service-user-configuration/services/show-service-user-configuration.service";
import enableServiceUserConfigurationService from "@/resources/v1/service-user-configuration/services/enable-service-user-configuration.service";
import disableServiceUserConfigurationService from "@/resources/v1/service-user-configuration/services/disable-service-user-configuration.service";
import deleteServiceUserConfigurationService from "@/resources/v1/service-user-configuration/services/delete-service-user-configuration.service";

describe("Service User Configuration (Integration)", () => {
  let testUser: any;
  let adminUser: any;
  let testIcon: any;
  let activeStatus: any;
  let service1: any;
  let service2: any;

  beforeAll(async () => {
    await BaseServiceModel.ensureIndexes();
    await DocumentModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await TaskUserMappingModel.ensureIndexes();
  });

  beforeEach(async () => {
    await TaskUserMappingModel.deleteMany({});
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

    const defaultPriority = await PriorityModel.create({
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
      email: "user@example.com",
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

    service1 = await ServiceModel.create({
      name: "Plumbing Service",
      type: serviceTypes.Service,
      description: "Plumbing repairs",
      icon: testIcon._id,
      estimated_time: 1,
      estimated_time_unit: timeUnits.hours,
      status_id: activeStatus._id,
      is_active: true,
      is_deleted: false,
    });

    service2 = await ServiceModel.create({
      name: "Electrical Service",
      type: serviceTypes.Service,
      description: "Electrical fixes",
      icon: testIcon._id,
      estimated_time: 2,
      estimated_time_unit: timeUnits.hours,
      status_id: activeStatus._id,
      is_active: true,
      is_deleted: false,
    });
  });

  it("should bulk store service user configurations successfully", async () => {
    const payload = {
      service_ids: [service1._id.toString(), service2._id.toString()],
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
    expect(result.result.data[0].result.length).toBe(2);

    const savedMappings = await TaskUserMappingModel.find({
      user_id: testUser._id,
      is_deleted: false,
    });
    expect(savedMappings.length).toBe(2);
  });

  it("should create a single service user configuration successfully", async () => {
    const payload = {
      service_id: service1._id.toString(),
      eligibility_status: "verified" as const,
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
    const data = result.result.data[0].result;
    expect(data.id).toBeDefined();
    expect(data.eligibility_status).toBe("verified");

    // Conflict on duplicate single create
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult = await createSingleServiceUserConfigurationService.execute(
        testUser._id.toString(),
        mockReq,
        payload,
      );
    });
    expect(duplicateResult.result.code).toBe(409);
  });

  it("should support complete lifecycle: list, show, disable, enable, and delete", async () => {
    // 1. Create a config mapping
    const mapping = await TaskUserMappingModel.create({
      user_id: testUser._id,
      task_id: service1._id,
      eligibility_status: "pending",
      is_active: true,
      is_deleted: false,
      status_id: activeStatus._id,
    });

    // 2. List configurations
    const mockListReq = {
      query: { user_id: testUser._id.toString() },
    } as any;

    const listResult: any = await listServiceUserConfigurationService.execute(mockListReq);
    expect(listResult.result.code).toBe(200);
    expect(listResult.result.data[0].result.totalCount).toBe(1);
    expect(listResult.result.data[0].result.rows.length).toBe(1);

    // 3. Show configuration
    const showResult: any = await showServiceUserConfigurationService.execute(mapping._id);
    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.id.toString()).toBe(mapping._id.toString());
    expect(showResult.result.data[0].result.service.name).toBe("Plumbing Service");

    // 4. Disable configuration
    const disableResult: any = await disableServiceUserConfigurationService.execute(
      mapping._id,
      testUser._id,
    );
    expect(disableResult.result.code).toBe(200);
    const disabledDoc = await TaskUserMappingModel.findById(mapping._id);
    expect(disabledDoc!.is_active).toBe(false);

    // 5. Enable configuration
    const enableResult: any = await enableServiceUserConfigurationService.execute(
      mapping._id,
      testUser._id,
    );
    expect(enableResult.result.code).toBe(200);
    const enabledDoc = await TaskUserMappingModel.findById(mapping._id);
    expect(enabledDoc!.is_active).toBe(true);

    // 6. Delete configuration (soft delete)
    const deleteResult: any = await deleteServiceUserConfigurationService.execute(
      mapping._id,
      testUser._id,
      true,
    );
    expect(deleteResult.result.code).toBe(200);
    const deletedDoc = await TaskUserMappingModel.findById(mapping._id);
    expect(deletedDoc!.is_deleted).toBe(true);
    expect(deletedDoc!.is_active).toBe(false);
  });
});
