import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import createBundleStatusesService from "@/resources/v1/masters/bundle-statuses/services/create-bundle-statuses.service";
import listBundleStatusesService from "@/resources/v1/masters/bundle-statuses/services/list-bundle-statuses.service";
import showBundleStatusesService from "@/resources/v1/masters/bundle-statuses/services/show-bundle-statuses.service";
import updateBundleStatusesService from "@/resources/v1/masters/bundle-statuses/services/update-bundle-statuses.service";
import deleteBundleStatusesService from "@/resources/v1/masters/bundle-statuses/services/delete-bundle-statuses.service";
import enableBundleStatusesService from "@/resources/v1/masters/bundle-statuses/services/enable-bundle-statuses.service";
import disableBundleStatusesService from "@/resources/v1/masters/bundle-statuses/services/disable-bundle-statuses.service";
import BundleStatusesModel from "@/database/bundle-statuses/bundle-statuses-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildBundleStatusesPayload } from "../../factories/bundle-statuses.factory";

describe("Bundle Statuses Master Service (Integration)", () => {
  let testUser: any;
  let defaultStatus: any;
  let defaultPriority: any;

  beforeAll(async () => {
    try {
      await BundleStatusesModel.collection.dropIndexes();
    } catch (e) {}
    await BundleStatusesModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    await BundleStatusesModel.deleteMany({});
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

  it("should successfully execute CRUD and state operations on bundle statuses", async () => {
    await BundleStatusesModel.deleteMany({});

    // 1. Create Bundle Status (First status, should be forced to is_default = true)
    const payload = buildBundleStatusesPayload({
      title: "Draft Status",
      label: "draft_status",
      color: "#808080",
      is_default: false,
    });
    let createResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult = await createBundleStatusesService.execute(
        { body: payload } as any,
        payload,
      );
    });

    expect(createResult.result.code).toBe(201);
    const bundleStatusId = createResult.result.data[0].result.id;
    expect(bundleStatusId).toBeDefined();
    expect(createResult.result.data[0].result.title).toBe("Draft Status");
    expect(createResult.result.data[0].result.is_default).toBe(true);

    // 1.5. Duplicate error (Since it is active)
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult = await createBundleStatusesService.execute(
        { body: payload } as any,
        payload,
      );
    });
    expect(duplicateResult.result.code).toBe(409);

    // 2. List Bundle Statuses
    const mockListReq = {
      query: { page: "1", limit: "10" },
      user: testUser,
    } as any;
    let listResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      listResult = await listBundleStatusesService.execute(mockListReq);
    });

    expect(listResult.result.code).toBe(200);
    expect(listResult.result.data[0].result.items.length).toBe(1);

    // 3. Show Bundle Status
    let showResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      showResult = await showBundleStatusesService.execute(
        new mongoose.Types.ObjectId(bundleStatusId),
      );
    });

    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.id.toString()).toBe(
      bundleStatusId.toString(),
    );

    // 4. Update Bundle Status
    const updatePayload = {
      title: "Updated Draft",
      color: "#666666",
    };
    let updateResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updateBundleStatusesService.execute(
        new mongoose.Types.ObjectId(bundleStatusId),
        { body: updatePayload, user: testUser } as any,
        updatePayload,
      );
    });

    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.title).toBe("Updated Draft");
    expect(updateResult.result.data[0].result.color).toBe("#666666");

    // 5. Create a second status (non-default) to test state transitions
    const payload2 = buildBundleStatusesPayload({
      title: "Archived Status",
      label: "archived_status",
      color: "#000000",
      is_default: false,
    });
    let createResult2: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult2 = await createBundleStatusesService.execute(
        { body: payload2 } as any,
        payload2,
      );
    });
    const bundleStatus2Id = createResult2.result.data[0].result.id;

    // 6. Disable Status
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult = await disableBundleStatusesService.execute(
        new mongoose.Types.ObjectId(bundleStatus2Id),
        testUser._id,
      );
    });
    expect(disableResult.result.code).toBe(200);

    // Verify it is disabled
    const docAfterDisable = await BundleStatusesModel.findOne({
      _id: bundleStatus2Id,
    });
    expect(docAfterDisable).toBeNull(); // findOne filters is_active: true by default

    // 7. Enable Status
    let enableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableResult = await enableBundleStatusesService.execute(
        new mongoose.Types.ObjectId(bundleStatus2Id),
        testUser._id,
      );
    });
    expect(enableResult.result.code).toBe(200);

    // 8. Delete Status (Soft delete)
    let deleteResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteResult = await deleteBundleStatusesService.execute(
        new mongoose.Types.ObjectId(bundleStatus2Id),
        testUser._id,
        true, // force = true because it's active
      );
    });
    expect(deleteResult.result.code).toBe(200);

    // Verify soft delete
    const docAfterDelete = await BundleStatusesModel.findOne({
      _id: bundleStatus2Id,
    });
    expect(docAfterDelete).toBeNull();
  });
});
