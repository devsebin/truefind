import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import createBundleLocationConfigStatusesService from "@/resources/v1/masters/bundle-location-config-statuses/services/create-bundle-location-config-statuses.service";
import listBundleLocationConfigStatusesService from "@/resources/v1/masters/bundle-location-config-statuses/services/list-bundle-location-config-statuses.service";
import showBundleLocationConfigStatusesService from "@/resources/v1/masters/bundle-location-config-statuses/services/show-bundle-location-config-statuses.service";
import updateBundleLocationConfigStatusesService from "@/resources/v1/masters/bundle-location-config-statuses/services/update-bundle-location-config-statuses.service";
import deleteBundleLocationConfigStatusesService from "@/resources/v1/masters/bundle-location-config-statuses/services/delete-bundle-location-config-statuses.service";
import enableBundleLocationConfigStatusesService from "@/resources/v1/masters/bundle-location-config-statuses/services/enable-bundle-location-config-statuses.service";
import disableBundleLocationConfigStatusesService from "@/resources/v1/masters/bundle-location-config-statuses/services/disable-bundle-location-config-statuses.service";
import BundleLocationConfigStatusesModel from "@/database/bundle-location-config-status/bundle-location-config-status-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildBundleLocationConfigStatusesPayload } from "../../factories/bundle-location-config-statuses.factory";

describe("Bundle Location Config Statuses Master Service (Integration)", () => {
  let testUser: any;
  let defaultStatus: any;
  let defaultPriority: any;

  beforeAll(async () => {
    try {
      await BundleLocationConfigStatusesModel.collection.dropIndexes();
    } catch (e) {}
    await BundleLocationConfigStatusesModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    await BundleLocationConfigStatusesModel.deleteMany({});
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

  it("should successfully execute CRUD and state operations on bundle location config statuses", async () => {
    await BundleLocationConfigStatusesModel.deleteMany({});

    // 1. Create Bundle Location Config Status (First status, should be forced to is_default = true)
    const payload = buildBundleLocationConfigStatusesPayload({
      title: "Draft Status",
      label: "draft_status",
      color: "#808080",
      is_default: false,
    });
    let createResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult =
        await createBundleLocationConfigStatusesService.execute(
          { body: payload } as any,
          payload,
        );
    });

    expect(createResult.result.code).toBe(201);
    const bundleLocationConfigStatusId =
      createResult.result.data[0].result.id;
    expect(bundleLocationConfigStatusId).toBeDefined();
    expect(createResult.result.data[0].result.title).toBe("Draft Status");
    expect(createResult.result.data[0].result.is_default).toBe(true);

    // 1.5. Duplicate error (Since it is active)
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult =
        await createBundleLocationConfigStatusesService.execute(
          { body: payload } as any,
          payload,
        );
    });
    expect(duplicateResult.result.code).toBe(409);

    // 2. List Bundle Location Config Statuses
    const mockListReq = {
      query: { page: "1", limit: "10" },
      user: testUser,
    } as any;
    let listResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      listResult =
        await listBundleLocationConfigStatusesService.execute(mockListReq);
    });

    expect(listResult.result.code).toBe(200);
    expect(listResult.result.data[0].result.items.length).toBe(1);

    // 3. Show Bundle Location Config Status
    let showResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      showResult =
        await showBundleLocationConfigStatusesService.execute(
          new mongoose.Types.ObjectId(bundleLocationConfigStatusId),
        );
    });

    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.id.toString()).toBe(
      bundleLocationConfigStatusId.toString(),
    );

    // 4. Update Bundle Location Config Status
    const updatePayload = {
      title: "Updated Draft",
      color: "#666666",
    };
    let updateResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult =
        await updateBundleLocationConfigStatusesService.execute(
          new mongoose.Types.ObjectId(bundleLocationConfigStatusId),
          { body: updatePayload, user: testUser } as any,
          updatePayload,
        );
    });

    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.title).toBe("Updated Draft");
    expect(updateResult.result.data[0].result.color).toBe("#666666");

    // 5. Create a second status (non-default) to test state transitions
    const payload2 = buildBundleLocationConfigStatusesPayload({
      title: "Archived Status",
      label: "archived_status",
      color: "#000000",
      is_default: false,
    });
    let createResult2: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult2 =
        await createBundleLocationConfigStatusesService.execute(
          { body: payload2 } as any,
          payload2,
        );
    });
    const bundleLocationConfigStatus2Id =
      createResult2.result.data[0].result.id;

    // 6. Disable Status
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult =
        await disableBundleLocationConfigStatusesService.execute(
          new mongoose.Types.ObjectId(bundleLocationConfigStatus2Id),
          testUser._id,
        );
    });
    expect(disableResult.result.code).toBe(200);

    // Verify it is disabled
    const docAfterDisable = await BundleLocationConfigStatusesModel.findOne({
      _id: bundleLocationConfigStatus2Id,
    });
    expect(docAfterDisable).toBeNull(); // findOne filters is_active: true by default

    // 7. Enable Status
    let enableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableResult =
        await enableBundleLocationConfigStatusesService.execute(
          new mongoose.Types.ObjectId(bundleLocationConfigStatus2Id),
          testUser._id,
        );
    });
    expect(enableResult.result.code).toBe(200);

    // 8. Delete Status (Soft delete)
    let deleteResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteResult =
        await deleteBundleLocationConfigStatusesService.execute(
          new mongoose.Types.ObjectId(bundleLocationConfigStatus2Id),
          testUser._id,
          true, // force = true because it's active
        );
    });
    expect(deleteResult.result.code).toBe(200);

    // Verify soft delete
    const docAfterDelete = await BundleLocationConfigStatusesModel.findOne({
      _id: bundleLocationConfigStatus2Id,
    });
    expect(docAfterDelete).toBeNull();
  });
});
