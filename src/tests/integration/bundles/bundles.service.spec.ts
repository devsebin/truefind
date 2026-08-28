import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import createBundlesService from "@/resources/v1/masters/bundles/services/create-bundles.service";
import listBundlesService from "@/resources/v1/masters/bundles/services/list-bundles.service";
import showBundlesService from "@/resources/v1/masters/bundles/services/show-bundles.service";
import updateBundlesService from "@/resources/v1/masters/bundles/services/update-bundles.service";
import deleteBundlesService from "@/resources/v1/masters/bundles/services/delete-bundles.service";
import enableBundlesService from "@/resources/v1/masters/bundles/services/enable-bundles.service";
import disableBundlesService from "@/resources/v1/masters/bundles/services/disable-bundles.service";
import BundleModel from "@/database/bundles/bundles-db-model";
import BundleServiceItemModel from "@/database/bundle-service-items/bundle-service-items-db-model";
import { ServiceModel } from "@/database/services/services-db-model";
import { timeUnits } from "@/database/services/services-db-interface";
import BundleStatusesModel from "@/database/bundle-statuses/bundle-statuses-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import { requestContext } from "@/utils/context/request-context";
import { buildBundlePayload } from "../../factories/bundles.factory";

describe("Bundles Master Service (Integration)", () => {
  let testUser: any;
  let defaultStatus: any;
  let defaultPriority: any;
  let testIconDoc: any;
  let testBundleStatus: any;

  beforeAll(async () => {
    try {
      await BundleModel.collection.dropIndexes();
      await BundleStatusesModel.collection.dropIndexes();
      await DocumentModel.collection.dropIndexes();
    } catch (e) {}
    await BundleModel.ensureIndexes();
    await BundleStatusesModel.ensureIndexes();
    await DocumentModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
  });

  beforeEach(async () => {
    await BundleModel.deleteMany({});
    await BundleStatusesModel.deleteMany({});
    await DocumentModel.deleteMany({});
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

    testIconDoc = await DocumentModel.create({
      name: "bundle_icon.png",
      document_type: "image",
      content_type: "image/png",
      keys: {
        original: "bundles/icons/test.png",
        thumbnails: [],
        webpThumbnails: [],
      },
      created_by: testUser._id,
      is_active: true,
      is_deleted: false,
    });

    testBundleStatus = await BundleStatusesModel.create({
      title: "Draft Status",
      label: "draft",
      color: "#808080",
      is_default: true,
      is_active: true,
      is_deleted: false,
      created_by: testUser._id,
    });
  });

  it("should successfully execute CRUD and state operations on bundles", async () => {
    // 1. Create Bundle
    const payload = buildBundlePayload({
      name: "Residential Cleaning",
      display_name: "Residential Deep Cleaning",
      code: "RES_CLEAN_01",
      icon: testIconDoc._id.toString(),
      status_id: testBundleStatus._id.toString(),
    });
    let createResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      createResult = await createBundlesService.execute(
        { body: payload, user: testUser } as any,
        payload,
      );
    });

    if (createResult.result.code !== 201) {
      console.error("CREATE BUNDLE ERROR:", JSON.stringify(createResult));
    }

    expect(createResult.result.code).toBe(201);
    const bundleId = createResult.result.data[0].result.id;
    expect(bundleId).toBeDefined();
    expect(createResult.result.data[0].result.name).toBe("Residential Cleaning");
    expect(createResult.result.data[0].result.code).toBe("RES_CLEAN_01");

    // 1.5. Duplicate code conflict error
    let duplicateResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      duplicateResult = await createBundlesService.execute(
        { body: payload, user: testUser } as any,
        payload,
      );
    });
    expect(duplicateResult.result.code).toBe(409);

    // 1.8 Create a sample Service and BundleServiceItem for this bundle
    const testService: any = await ServiceModel.create({
      name: "Floor Scrubbing",
      description: "Deep floor scrubbing",
      icon: testIconDoc._id,
      estimated_time: 2,
      estimated_time_unit: timeUnits.hours,
      status_id: defaultStatus._id,
      is_active: true,
      is_deleted: false,
    });

    const testServiceItem = await BundleServiceItemModel.create({
      bundle_id: new mongoose.Types.ObjectId(bundleId),
      service_id: testService._id,
      sort_order: 1,
      quantity: 2,
      is_mandatory: true,
      is_included: true,
      service_name_snapshot: "Floor Scrubbing",
      service_code_snapshot: "FLR-01",
      is_active: true,
      is_deleted: false,
    });

    // 2. List Bundles
    const mockListReq = {
      query: { page: "1", limit: "10" },
      originalUrl: "/api/v1/masters/bundles",
      method: "GET",
      user: testUser,
    } as any;
    let listResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      listResult = await listBundlesService.execute(mockListReq);
    });

    expect(listResult.result.code).toBe(200);
    expect(listResult.result.data[0].result.items.length).toBe(1);
    expect(listResult.result.data[0].result.items[0].services).toBeDefined();
    expect(listResult.result.data[0].result.items[0].services.length).toBe(1);
    expect(listResult.result.data[0].result.items[0].services[0].id.toString()).toBe(
      testServiceItem._id.toString(),
    );
    expect(listResult.result.data[0].result.items[0].services[0].service.name).toBe(
      "Floor Scrubbing",
    );

    // 3. Show Bundle
    let showResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      showResult = await showBundlesService.execute(
        new mongoose.Types.ObjectId(bundleId),
      );
    });

    expect(showResult.result.code).toBe(200);
    expect(showResult.result.data[0].result.id.toString()).toBe(
      bundleId.toString(),
    );
    expect(showResult.result.data[0].result.services).toBeDefined();
    expect(showResult.result.data[0].result.services.length).toBe(1);
    expect(showResult.result.data[0].result.services[0].id.toString()).toBe(
      testServiceItem._id.toString(),
    );
    expect(showResult.result.data[0].result.services[0].service.name).toBe(
      "Floor Scrubbing",
    );

    // 4. Update Bundle
    const updatePayload = {
      display_name: "Updated Residential Deep Cleaning",
      description: "Updated description for bundle",
    };
    let updateResult: any;

    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      updateResult = await updateBundlesService.execute(
        new mongoose.Types.ObjectId(bundleId),
        { body: updatePayload, user: testUser } as any,
        updatePayload,
      );
    });

    expect(updateResult.result.code).toBe(200);
    expect(updateResult.result.data[0].result.display_name).toBe(
      "Updated Residential Deep Cleaning",
    );

    // 5. Disable Bundle
    let disableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      disableResult = await disableBundlesService.execute(
        new mongoose.Types.ObjectId(bundleId),
        testUser._id,
      );
    });
    expect(disableResult.result.code).toBe(200);

    // Verify it is disabled
    const docAfterDisable = await BundleModel.findOne({
      _id: bundleId,
    });
    expect(docAfterDisable?.is_active).toBe(false);

    // 6. Enable Bundle
    let enableResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      enableResult = await enableBundlesService.execute(
        new mongoose.Types.ObjectId(bundleId),
        testUser._id,
      );
    });
    expect(enableResult.result.code).toBe(200);

    // 7. Delete Bundle (Soft delete)
    let deleteResult: any;
    await requestContext.run({ userId: testUser._id.toString() }, async () => {
      deleteResult = await deleteBundlesService.execute(
        new mongoose.Types.ObjectId(bundleId),
        testUser._id,
        true, // force = true because it's active
      );
    });
    expect(deleteResult.result.code).toBe(200);

    // Verify soft delete
    const docAfterDelete = await BundleModel.findOne({
      _id: bundleId,
    });
    expect(docAfterDelete).toBeNull();
  });
});
