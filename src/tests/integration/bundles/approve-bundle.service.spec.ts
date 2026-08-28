import { describe, it, expect, beforeAll, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import createBundlesService from "@/resources/v1/masters/bundles/services/create-bundles.service";
import approveBundleService from "@/resources/v1/masters/bundles/services/approve-bundle.service";
import BundleModel from "@/database/bundles/bundles-db-model";
import BundleServiceItemModel from "@/database/bundle-service-items/bundle-service-items-db-model";
import BundleAreaConfigurationModel from "@/database/bundle-area-configuration/bundle-area-configuration-db-model";
import { ServiceModel } from "@/database/services/services-db-model";
import { timeUnits } from "@/database/services/services-db-interface";
import BundleStatusesModel from "@/database/bundle-statuses/bundle-statuses-db-model";
import DocumentModel from "@/database/documents/documents-db-model";
import UserModel from "@/database/users/users-db-model";
import StatusModel from "@/database/status/status-db-model";
import PriorityModel from "@/database/priority/priority-db-model";
import SuburbModel from "@/database/suburbs/suburbs-db-model";
import CountryModel from "@/database/countries/countries-db-model";
import RegionModel from "@/database/regions/regions-db-model";
import DistrictModel from "@/database/districts/districts-db-model";
import TaskUserMappingModel from "@/database/service-user-configuration/service-user-configuration-db-model";
import NotificationModel from "@/database/notifications/notifications-db-model";
import NotificationRecipientModel from "@/database/notification-recipients/notification-recipients-db-model";
import { NotificationRecipientStatus } from "@/database/notification-recipients/notification-recipients-db-interface";
import { requestContext } from "@/utils/context/request-context";
import { buildBundlePayload } from "../../factories/bundles.factory";
import { buildSuburbPayload } from "../../factories/suburb.factory";
import {
  getActiveBundleStatusId,
  getClearedBundleStatusId,
  getDefaultBundleStatusId,
} from "@/utils/plugins/bundle-status.plugin";

describe("Approve Bundle & Notification Service (Integration)", () => {
  let adminUser: any;
  let regularUser1: any;
  let regularUser2: any;
  let regularUser3: any;
  let defaultStatus: any;
  let defaultPriority: any;
  let testIconDoc: any;
  let draftBundleStatusId: any;
  let clearedBundleStatusId: any;
  let activeBundleStatusId: any;
  let country: any;
  let region: any;
  let district: any;
  let suburb1: any;
  let suburb2: any;
  let serviceA: any;
  let serviceB: any;

  beforeAll(async () => {
    await BundleModel.ensureIndexes();
    await BundleServiceItemModel.ensureIndexes();
    await BundleAreaConfigurationModel.ensureIndexes();
    await ServiceModel.ensureIndexes();
    await BundleStatusesModel.ensureIndexes();
    await DocumentModel.ensureIndexes();
    await UserModel.ensureIndexes();
    await StatusModel.ensureIndexes();
    await PriorityModel.ensureIndexes();
    await SuburbModel.ensureIndexes();
    await TaskUserMappingModel.ensureIndexes();
    await NotificationModel.ensureIndexes();
    await NotificationRecipientModel.ensureIndexes();
  });

  beforeEach(async () => {
    await BundleModel.deleteMany({});
    await BundleServiceItemModel.deleteMany({});
    await BundleAreaConfigurationModel.deleteMany({});
    await ServiceModel.deleteMany({});
    await BundleStatusesModel.deleteMany({});
    await DocumentModel.deleteMany({});
    await UserModel.deleteMany({});
    await StatusModel.deleteMany({});
    await PriorityModel.deleteMany({});
    await SuburbModel.deleteMany({});
    await CountryModel.deleteMany({});
    await RegionModel.deleteMany({});
    await DistrictModel.deleteMany({});
    await TaskUserMappingModel.deleteMany({});
    await NotificationModel.deleteMany({});
    await NotificationRecipientModel.deleteMany({});

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

    testIconDoc = await DocumentModel.create({
      name: "bundle_icon.png",
      document_type: "image",
      content_type: "image/png",
      keys: {
        original: "bundles/icons/test.png",
        thumbnails: [],
        webpThumbnails: [],
      },
      status_id: defaultStatus._id,
      is_active: true,
      is_deleted: false,
    });

    draftBundleStatusId = await getDefaultBundleStatusId();
    clearedBundleStatusId = await getClearedBundleStatusId();
    activeBundleStatusId = await getActiveBundleStatusId();

    country = await CountryModel.create({
      name: "New Zealand",
      iso_code: "NZ",
      iso_code_3: "NZL",
      phone_code: "64",
      continent: "Oceania",
      currency: "NZD",
      status_id: defaultStatus._id,
    });

    region = await RegionModel.create({
      name: "Auckland",
      code: "AKL",
      country_id: country._id,
      status_id: defaultStatus._id,
    });

    district = await DistrictModel.create({
      name: "Auckland Central",
      code: "AKL-CENTRAL",
      region_id: region._id,
      country_id: country._id,
      status_id: defaultStatus._id,
    });

    suburb1 = await SuburbModel.create(
      buildSuburbPayload({
        name: "Ponsonby",
        code: "PONSONBY",
        country_id: country._id,
        region_id: region._id,
        district_id: district._id,
        post_code: "1011",
        status_id: defaultStatus._id,
      }),
    );

    suburb2 = await SuburbModel.create(
      buildSuburbPayload({
        name: "Grey Lynn",
        code: "GREYLYNN",
        country_id: country._id,
        region_id: region._id,
        district_id: district._id,
        post_code: "1021",
        status_id: defaultStatus._id,
      }),
    );

    adminUser = await UserModel.create({
      first_name: "Admin",
      last_name: "User",
      email: "admin@example.com",
      role: "admin",
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });

    regularUser1 = await UserModel.create({
      first_name: "Eligible",
      last_name: "User",
      email: "eligible@example.com",
      role: "user",
      suburb_id: suburb1._id,
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });

    regularUser2 = await UserModel.create({
      first_name: "Ineligible",
      last_name: "User",
      email: "ineligible@example.com",
      role: "user",
      suburb_id: suburb1._id,
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });

    regularUser3 = await UserModel.create({
      first_name: "OtherSuburb",
      last_name: "User",
      email: "other@example.com",
      role: "user",
      suburb_id: suburb2._id,
      status_id: defaultStatus._id,
      priority_id: defaultPriority._id,
    });

    serviceA = await ServiceModel.create({
      name: "Plumbing Inspection",
      description: "Plumbing check",
      icon: testIconDoc._id,
      estimated_time: 1,
      estimated_time_unit: timeUnits.hours,
      status_id: defaultStatus._id,
      is_active: true,
      is_deleted: false,
    });

    serviceB = await ServiceModel.create({
      name: "Pipe Repair",
      description: "Repair burst pipe",
      icon: testIconDoc._id,
      estimated_time: 2,
      estimated_time_unit: timeUnits.hours,
      status_id: defaultStatus._id,
      is_active: true,
      is_deleted: false,
    });
  });

  it("should fail approval when bundle has no active services", async () => {
    const payload = buildBundlePayload({
      name: "Empty Bundle",
      code: "EMPTY_01",
      icon: testIconDoc._id.toString(),
      status_id: clearedBundleStatusId.toString(),
    });

    let createResult: any;
    await requestContext.run({ userId: adminUser._id.toString() }, async () => {
      createResult = await createBundlesService.execute(
        { body: payload, user: adminUser } as any,
        payload,
      );
    });

    const bundleId = createResult.result.data[0].result.id;

    let approveResult: any;
    await requestContext.run({ userId: adminUser._id.toString() }, async () => {
      approveResult = await approveBundleService.execute(
        new mongoose.Types.ObjectId(bundleId),
        adminUser._id,
      );
    });

    expect(approveResult.result.code).toBe(400);
    expect(approveResult.result.message).toContain("Bundle is not in an approvable state");
  });

  it("should approve bundle and broadcast notification ONLY to 100% eligible users in suburb", async () => {
    // 1. Create Bundle
    const payload = buildBundlePayload({
      name: "Complete Plumbing Pack",
      code: "PLUMB_PACK_01",
      icon: testIconDoc._id.toString(),
      status_id: clearedBundleStatusId.toString(),
    });

    let createResult: any;
    await requestContext.run({ userId: adminUser._id.toString() }, async () => {
      createResult = await createBundlesService.execute(
        { body: payload, user: adminUser } as any,
        payload,
      );
    });
    const bundleId = createResult.result.data[0].result.id;

    // 2. Add services A and B to the bundle
    await BundleServiceItemModel.create({
      bundle_id: new mongoose.Types.ObjectId(bundleId),
      service_id: serviceA._id,
      sort_order: 1,
      is_mandatory: true,
      is_included: true,
      is_active: true,
      is_deleted: false,
    });

    await BundleServiceItemModel.create({
      bundle_id: new mongoose.Types.ObjectId(bundleId),
      service_id: serviceB._id,
      sort_order: 2,
      is_mandatory: true,
      is_included: true,
      is_active: true,
      is_deleted: false,
    });

    // 3. Configure bundle area for suburb1
    await BundleAreaConfigurationModel.create({
      bundle_id: new mongoose.Types.ObjectId(bundleId),
      suburb_id: suburb1._id,
      is_active: true,
      is_deleted: false,
    });

    // 4. Configure user eligibility:
    // User1 (suburb1) has BOTH Service A and Service B approved -> Eligible
    await TaskUserMappingModel.create({
      user_id: regularUser1._id,
      task_id: serviceA._id,
      eligibility_status: "approved",
      is_active: true,
      is_deleted: false,
    });
    await TaskUserMappingModel.create({
      user_id: regularUser1._id,
      task_id: serviceB._id,
      eligibility_status: "verified",
      is_active: true,
      is_deleted: false,
    });

    // User2 (suburb1) has only Service A approved, missing Service B -> Ineligible
    await TaskUserMappingModel.create({
      user_id: regularUser2._id,
      task_id: serviceA._id,
      eligibility_status: "approved",
      is_active: true,
      is_deleted: false,
    });

    // User3 (suburb2) has both services approved, but is in suburb2 (not in bundle area) -> Ineligible
    await TaskUserMappingModel.create({
      user_id: regularUser3._id,
      task_id: serviceA._id,
      eligibility_status: "approved",
      is_active: true,
      is_deleted: false,
    });
    await TaskUserMappingModel.create({
      user_id: regularUser3._id,
      task_id: serviceB._id,
      eligibility_status: "approved",
      is_active: true,
      is_deleted: false,
    });

    // 5. Approve Bundle
    const customEventId = `test-approval-${bundleId}`;
    let approveResult: any;
    await requestContext.run({ userId: adminUser._id.toString() }, async () => {
      approveResult = await approveBundleService.execute(
        new mongoose.Types.ObjectId(bundleId),
        adminUser._id,
        customEventId,
      );
    });

    expect(approveResult.result.code).toBe(200);
    expect(approveResult.result.data[0].result.is_active).toBe(true);

    // Wait for asynchronous notification processing
    await approveBundleService.processBundleApprovalNotifications(
      new mongoose.Types.ObjectId(bundleId),
      adminUser._id,
      "Complete Plumbing Pack",
      customEventId,
    );

    // 6. Verify Notifications
    const notifications = await NotificationModel.find({
      bundleId: new mongoose.Types.ObjectId(bundleId),
    });
    expect(notifications.length).toBe(1);
    expect(notifications[0]?.suburbId?.toString()).toBe(suburb1._id.toString());
    expect(notifications[0]?.title).toBe("Bundle Approved");

    // 7. Verify Recipients: ONLY regularUser1 must have a recipient record
    const recipients = await NotificationRecipientModel.find({
      notificationId: notifications[0]._id,
    });
    expect(recipients.length).toBe(1);
    expect(recipients[0].userId.toString()).toBe(regularUser1._id.toString());
    expect(recipients[0].status).toBe(NotificationRecipientStatus.SENT);

    // Verify User2 and User3 did NOT receive notification
    const recipientUser2 = await NotificationRecipientModel.findOne({
      userId: regularUser2._id,
    });
    expect(recipientUser2).toBeNull();

    const recipientUser3 = await NotificationRecipientModel.findOne({
      userId: regularUser3._id,
    });
    expect(recipientUser3).toBeNull();
  });

  it("should prevent duplicate notifications on retry (idempotency)", async () => {
    const payload = buildBundlePayload({
      name: "Idempotent Bundle",
      code: "IDEM_01",
      icon: testIconDoc._id.toString(),
      status_id: clearedBundleStatusId.toString(),
    });

    let createResult: any;
    await requestContext.run({ userId: adminUser._id.toString() }, async () => {
      createResult = await createBundlesService.execute(
        { body: payload, user: adminUser } as any,
        payload,
      );
    });
    const bundleId = createResult.result.data[0].result.id;

    await BundleServiceItemModel.create({
      bundle_id: new mongoose.Types.ObjectId(bundleId),
      service_id: serviceA._id,
      sort_order: 1,
      is_mandatory: true,
      is_included: true,
      is_active: true,
      is_deleted: false,
    });

    await BundleAreaConfigurationModel.create({
      bundle_id: new mongoose.Types.ObjectId(bundleId),
      suburb_id: suburb1._id,
      is_active: true,
      is_deleted: false,
    });

    await TaskUserMappingModel.create({
      user_id: regularUser1._id,
      task_id: serviceA._id,
      eligibility_status: "approved",
      is_active: true,
      is_deleted: false,
    });

    const eventId = `test-idempotency-${bundleId}`;

    // First broadcast run
    await approveBundleService.processBundleApprovalNotifications(
      new mongoose.Types.ObjectId(bundleId),
      adminUser._id,
      "Idempotent Bundle",
      eventId,
    );

    // Second broadcast run with same eventId
    await approveBundleService.processBundleApprovalNotifications(
      new mongoose.Types.ObjectId(bundleId),
      adminUser._id,
      "Idempotent Bundle",
      eventId,
    );

    const notifications = await NotificationModel.find({
      bundleId: new mongoose.Types.ObjectId(bundleId),
    });
    expect(notifications.length).toBe(1);

    const recipients = await NotificationRecipientModel.find({
      userId: regularUser1._id,
    });
    expect(recipients.length).toBe(1);
  });
});
