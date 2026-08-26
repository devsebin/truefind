import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import createBundleUserMappingStatusService from "@/resources/v1/masters/bundle-user-mapping-status/services/create-bundle-user-mapping-status.service";
import listBundleUserMappingStatusService from "@/resources/v1/masters/bundle-user-mapping-status/services/list-bundle-user-mapping-status.service";
import showBundleUserMappingStatusService from "@/resources/v1/masters/bundle-user-mapping-status/services/show-bundle-user-mapping-status.service";
import updateBundleUserMappingStatusService from "@/resources/v1/masters/bundle-user-mapping-status/services/update-bundle-user-mapping-status.service";
import deleteBundleUserMappingStatusService from "@/resources/v1/masters/bundle-user-mapping-status/services/delete-bundle-user-mapping-status.service";
import enableBundleUserMappingStatusService from "@/resources/v1/masters/bundle-user-mapping-status/services/enable-bundle-user-mapping-status.service";
import disableBundleUserMappingStatusService from "@/resources/v1/masters/bundle-user-mapping-status/services/disable-bundle-user-mapping-status.service";
import BundleUserMappingStatusModel from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildBundleUserMappingStatusPayload } from "../../factories/bundle-user-mapping-status.factory";

describe("Bundle User Mapping Status Master Service (Integration)", () => {
  let testUser: any;
  let defaultStatus: any;
  let defaultPriority: any;

  beforeAll(async () => {
    try {
      await BundleUserMappingStatusModel.collection.dropIndexes();
    } catch (e) {}
    await BundleUserMappingStatusModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    await BundleUserMappingStatusModel.deleteMany({});
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

  it("should successfully execute CRUD and state operations on bundle user mapping status", async () => {
    await BundleUserMappingStatusModel.deleteMany({});

    // 1. Create Status (First status, should be forced to is_default = true)
    const payload = buildBundleUserMappingStatusPayload({
      title: "Pending Approval",
      label: "pending_approval",
      color: "#FFA500",
      is_default: false,
    });
    let createResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult = await createBundleUserMappingStatusService.execute(
        { body: payload } as any,
        payload,
      );
    });

    expect(createResult.result.code).toBe(201);
    const statusId = createResult.result.data[0].result.id;
    expect(statusId).toBeDefined();
    expect(createResult.result.data[0].result.title).toBe("Pending Approval");
    expect(createResult.result.data[0].result.is_default).toBe(true);

    // 1.5. Duplicate error (Since it is active)
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult = await createBundleUserMappingStatusService.execute(
        { body: payload } as any,
        payload,
      );
    });
    expect(duplicateResult.result.code).toBe(409);

    // 2. List Statuses
    const mockListReq = {
      query: { page: "1", limit: "10" },
      user: testUser,
    } as any;
    let listResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      listResult = await listBundleUserMappingStatusService.execute(mockListReq);
    });

    expect(listResult.result.code).toBe(200);
    expect(listResult.result.data[0].result.items.length).toBe(1);

    // 3. Show Status
    let showResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      showResult = await showBundleUserMappingStatusService.execute(
        new mongoose.Types.ObjectId(statusId),
      );
    });

    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.id.toString()).toBe(
      statusId.toString(),
    );

    // 4. Update Status
    const updatePayload = {
      title: "Updated Pending Approval",
      color: "#FF8C00",
    };
    let updateResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updateBundleUserMappingStatusService.execute(
        new mongoose.Types.ObjectId(statusId),
        { body: updatePayload, user: testUser } as any,
        updatePayload,
      );
    });

    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.title).toBe("Updated Pending Approval");
    expect(updateResult.result.data[0].result.color).toBe("#FF8C00");

    // 5. Create a second status (non-default) to test state transitions
    const payload2 = buildBundleUserMappingStatusPayload({
      title: "Cancelled Status",
      label: "cancelled_status",
      color: "#808080",
      is_default: false,
    });
    let createResult2: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult2 = await createBundleUserMappingStatusService.execute(
        { body: payload2 } as any,
        payload2,
      );
    });
    const status2Id = createResult2.result.data[0].result.id;

    // 6. Disable Status
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult = await disableBundleUserMappingStatusService.execute(
        new mongoose.Types.ObjectId(status2Id),
        testUser._id,
      );
    });
    expect(disableResult.result.code).toBe(200);

    // Verify it is disabled
    const docAfterDisable = await BundleUserMappingStatusModel.findOne({
      _id: status2Id,
    });
    expect(docAfterDisable).toBeNull(); // findOne filters is_active: true by default

    // 7. Enable Status
    let enableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableResult = await enableBundleUserMappingStatusService.execute(
        new mongoose.Types.ObjectId(status2Id),
        testUser._id,
      );
    });
    expect(enableResult.result.code).toBe(200);

    // 8. Delete Status (Soft delete)
    let deleteResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteResult = await deleteBundleUserMappingStatusService.execute(
        new mongoose.Types.ObjectId(status2Id),
        testUser._id,
        true, // force = true because it's active
      );
    });
    expect(deleteResult.result.code).toBe(200);

    // Verify soft delete
    const docAfterDelete = await BundleUserMappingStatusModel.findOne({
      _id: status2Id,
    });
    expect(docAfterDelete).toBeNull();
  });
});
