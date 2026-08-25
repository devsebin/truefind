import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import createServiceStatusesService from "@/resources/v1/masters/service-statuses/services/create-service-statuses.service";
import listServiceStatusesService from "@/resources/v1/masters/service-statuses/services/list-service-statuses.service";
import showServiceStatusesService from "@/resources/v1/masters/service-statuses/services/show-service-statuses.service";
import updateServiceStatusesService from "@/resources/v1/masters/service-statuses/services/update-service-statuses.service";
import deleteServiceStatusesService from "@/resources/v1/masters/service-statuses/services/delete-service-statuses.service";
import enableServiceStatusesService from "@/resources/v1/masters/service-statuses/services/enable-service-statuses.service";
import disableServiceStatusesService from "@/resources/v1/masters/service-statuses/services/disable-service-statuses.service";
import ServiceStatusModel from "@/database/service-status/service-status-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildServiceStatusesPayload } from "../../factories/service-statuses.factory";

describe("Service Statuses Master Service (Integration)", () => {
  let testUser: any;
  let defaultStatus: any;
  let defaultPriority: any;

  beforeAll(async () => {
    try {
      await ServiceStatusModel.collection.dropIndexes();
    } catch (e) {}
    await ServiceStatusModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    await ServiceStatusModel.deleteMany({});
    await UserModel.deleteMany({});
    await StatusModel.deleteMany({});
    await PriorityModel.deleteMany({});

    defaultStatus = await StatusModel.create({
      title: "Active",
      label: "Active status",
      color: "#000000",
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
      status_id: defaultStatus._id,
    });

    testUser = await UserModel.create({
      first_name: "John",
      last_name: "Doe",
      email: "testuser@example.com",
      role: "super_admin",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });
  });

  it("should successfully execute CRUD and state operations on service statuses", async () => {
    await ServiceStatusModel.deleteMany({});

    // 1. Create Service Status (First status, should be forced to is_default = true)
    const payload = buildServiceStatusesPayload({
      title: "In Service",
      label: "in_service",
      color: "#00ff00",
      is_default: false,
    });
    let createResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult = await createServiceStatusesService.execute(
        { body: payload } as any,
        payload,
      );
    });

    expect(createResult.result.code).toBe(201);
    const serviceStatusId = createResult.result.data[0].result.id;
    expect(serviceStatusId).toBeDefined();
    expect(createResult.result.data[0].result.title).toBe("In Service");
    expect(createResult.result.data[0].result.is_default).toBe(true);

    // 1.5. Duplicate error (Since it is active)
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult = await createServiceStatusesService.execute(
        { body: payload } as any,
        payload,
      );
    });
    expect(duplicateResult.result.code).toBe(409);

    // 2. Show Service Status
    const showResult: any = await showServiceStatusesService.execute(
      serviceStatusId,
    );
    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.title).toBe("In Service");

    // 2.5 Show 404
    const fakeId = new mongoose.Types.ObjectId();
    const show404Result: any = await showServiceStatusesService.execute(fakeId);
    expect(show404Result.result.code).toBe(404);

    // 3. Create Second Service Status
    const payload2 = buildServiceStatusesPayload({
      title: "Service Done",
      label: "service_done",
      color: "#0000ff",
      is_default: false,
    });
    let createResult2: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult2 = await createServiceStatusesService.execute(
        { body: payload2 } as any,
        payload2,
      );
    });
    expect(createResult2.result.code).toBe(201);
    const serviceStatus2Id = createResult2.result.data[0].result.id;
    expect(createResult2.result.data[0].result.is_default).toBe(false);

    // 4. Update Service Status 2 to be default
    let updateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updateServiceStatusesService.execute(
        serviceStatus2Id,
        { body: { is_default: true, title: "Completed Service" } } as any,
      );
    });
    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.is_default).toBe(true);

    // Check first service status lost default status
    const showOldDefault: any = await showServiceStatusesService.execute(
      serviceStatusId,
    );
    expect(showOldDefault.result.data[0].result.is_default).toBe(false);

    // 5. List Service Statuses
    const listResult: any = await listServiceStatusesService.execute({
      query: { page: "1", limit: "10" },
      originalUrl: "/api/v1/masters/service-statuses",
      method: "GET",
    } as any);
    expect(listResult.result.code).toBe(200);
    expect(listResult.result.data[0].result.totalCount).toBe(2);

    // 6. Disable Service Status 1
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult = await disableServiceStatusesService.execute(
        serviceStatusId,
        testUser._id,
      );
    });
    expect(disableResult.result.code).toBe(200);
    const disabledStatus = await ServiceStatusModel.findById(serviceStatusId);
    expect(disabledStatus!.is_active).toBe(false);

    // 6.5 Cannot disable default service status
    let disableDefaultResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableDefaultResult = await disableServiceStatusesService.execute(
        serviceStatus2Id,
        testUser._id,
      );
    });
    expect(disableDefaultResult.result.code).toBe(409);

    // 7. Enable Service Status 1
    let enableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableResult = await enableServiceStatusesService.execute(
        serviceStatusId,
        testUser._id,
      );
    });
    expect(enableResult.result.code).toBe(200);
    const enabledStatus = await ServiceStatusModel.findById(serviceStatusId);
    expect(enabledStatus!.is_active).toBe(true);

    // 8. Delete Service Status 1 (Soft Delete with confirmation if active)
    let deleteNoForceResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteNoForceResult = await deleteServiceStatusesService.execute(
        serviceStatusId,
        testUser._id,
        false,
      );
    });
    expect(deleteNoForceResult.result.code).toBe(400); // Confirmation required

    let deleteForceResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteForceResult = await deleteServiceStatusesService.execute(
        serviceStatusId,
        testUser._id,
        true,
      );
    });
    expect(deleteForceResult.result.code).toBe(200);
    const deletedStatus = await ServiceStatusModel.findById(serviceStatusId);
    expect(deletedStatus!.is_deleted).toBe(true);

    // 8.5 Cannot delete default service status
    let deleteDefaultResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteDefaultResult = await deleteServiceStatusesService.execute(
        serviceStatus2Id,
        testUser._id,
        true,
      );
    });
    expect(deleteDefaultResult.result.code).toBe(409);
  });
});
