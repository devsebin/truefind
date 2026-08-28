import mongoose from "mongoose";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
  buildErrorResult,
  ErrorResponse,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import findBundlesHelperService from "../helpers/validators/find-bundles.helper.service";
import { bundlesErrorsMessages } from "../bundles.messages";
import { bundlesPayload, populateFields } from "../bundles.helper";
import { bundleResponse } from "../bundles.response";
import approveBundleHelperService from "../helpers/operations/approve-bundle.helper.service";
import BundleServiceItemModel from "@/database/bundle-service-items/bundle-service-items-db-model";
import BundleAreaConfigurationModel from "@/database/bundle-area-configuration/bundle-area-configuration-db-model";
import UserModel from "@/database/users/users-db-model";
import TaskUserMappingModel from "@/database/service-user-configuration/service-user-configuration-db-model";
import NotificationModel from "@/database/notifications/notifications-db-model";
import NotificationRecipientModel from "@/database/notification-recipients/notification-recipients-db-model";
import { NotificationType } from "@/database/notifications/notifications-db-interface";
import { NotificationRecipientStatus } from "@/database/notification-recipients/notification-recipients-db-interface";
import messageBroadcastingService from "@/services/broadcasting/services/message-broadcasting.service";

class ApproveBundleService {
  public async execute(
    id: mongoose.Types.ObjectId,
    userId: mongoose.Types.ObjectId,
    customEventId?: string,
  ): Promise<SingleResponse | ErrorResponse> {
    const session = await mongoose.startSession();
    const dbTransactions: DbTransaction[] = [];
    let approvedBundle: any;

    try {
      session.startTransaction();

      const bundles = await findBundlesHelperService.execute(
        {
          _id: id,
          is_deleted: { $in: [true, false] },
        } as any,
        bundlesErrorsMessages,
        {
          throwIfNotFound: true,
          returnDocument: true,
          session,
        },
      );

      const updated = await approveBundleHelperService.execute(
        bundles[0],
        session,
        userId,
        dbTransactions,
        bundlesErrorsMessages,
      );

      await updated.populate(populateFields);
      approvedBundle = updated.toObject();

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      const err = error as Error & { data?: any };

      return buildErrorResult(
        err.message,
        bundlesErrorsMessages,
        err.data,
      );
    } finally {
      session.endSession();
    }

    // Trigger Notification Workflow Asynchronously / in Background
    // Ensure notification failure does not roll back a successful bundle approval
    this.processBundleApprovalNotifications(
      id,
      userId,
      approvedBundle.name || "Bundle",
      customEventId,
    ).catch((notification_error) => {
      console.error("[Bundle Approval Notification Error]", notification_error);
    });

    const bundleServiceItems = await BundleServiceItemModel.find({
      bundle_id: id,
      is_deleted: false,
    })
      .populate({
        path: "service_id",
        select: "name code description icon status_id is_active is_deleted",
      })
      .sort({ sort_order: 1, createdAt: 1 })
      .lean();

    return bundlesPayload(
      "bundle_approved",
      bundleResponse(approvedBundle, bundleServiceItems),
      dbTransactions,
    );
  }

  public async processBundleApprovalNotifications(
    bundleId: mongoose.Types.ObjectId,
    adminUserId: mongoose.Types.ObjectId,
    bundleName: string,
    customEventId?: string,
  ): Promise<void> {
    const eventId = customEventId || `bundle-approval-${bundleId.toString()}-${Date.now()}`;

    // 1. Get all active service items in this bundle
    const bundleServiceItems = await BundleServiceItemModel.find({
      bundle_id: bundleId,
      is_active: true,
      is_deleted: false,
    }).lean();

    if (bundleServiceItems.length === 0) {
      return;
    }

    const serviceIds = bundleServiceItems.map((item) => item.service_id);

    // 2. Identify suburbs associated with the bundle
    const areaConfigs = await BundleAreaConfigurationModel.find({
      bundle_id: bundleId,
      is_active: true,
      is_deleted: false,
    }).lean();

    let suburbIds: mongoose.Types.ObjectId[] = areaConfigs
      .map((cfg) => cfg.suburb_id)
      .filter(Boolean);

    // If no specific area configurations, find all suburbs of users who might be in the system
    if (suburbIds.length === 0) {
      const distinctSuburbs = await UserModel.distinct("suburb_id", {
        suburb_id: { $ne: null },
        is_active: true,
        is_deleted: false,
      });
      suburbIds = distinctSuburbs.filter(Boolean);
    }

    if (suburbIds.length === 0) {
      return;
    }

    // Process for each suburb
    for (const suburbId of suburbIds) {
      // Check for existing notification for this bundle, suburb, and event
      let notification = await NotificationModel.findOne({
        bundleId,
        suburbId,
        type: NotificationType.BUNDLE_APPROVED,
        "metadata.eventId": eventId,
      });

      if (!notification) {
        notification = await NotificationModel.create({
          type: NotificationType.BUNDLE_APPROVED,
          title: "Bundle Approved",
          message: `The ${bundleName} bundle is now available in your area.`,
          bundleId,
          suburbId,
          createdBy: adminUserId,
          metadata: {
            bundleName,
            serviceIds,
            eventId,
          },
        });
      }

      // 3. Find users in this suburb
      const usersInSuburb = await UserModel.find({
        suburb_id: suburbId,
        is_active: true,
        is_deleted: false,
      }).lean();

      if (usersInSuburb.length === 0) {
        continue;
      }

      const eligibleRecipients: Array<{ _id: any; userId: any }> = [];

      // 4. Validate that each user has ALL services in the bundle enabled/eligible
      for (const user of usersInSuburb) {
        // Query user's approved/active tasks from TaskUserMappingModel
        const userTaskMappings = await TaskUserMappingModel.find({
          user_id: user._id,
          task_id: { $in: serviceIds },
          is_active: true,
          is_deleted: false,
          eligibility_status: { $in: ["approved", "verified", "success"] },
        }).lean();

        // Check if count of eligible services matches the total serviceIds count
        const enabledServiceIdsSet = new Set(
          userTaskMappings.map((m) => m.task_id.toString()),
        );

        const hasAllServices = serviceIds.every((sId) =>
          enabledServiceIdsSet.has(sId.toString()),
        );

        if (!hasAllServices) {
          // If any service is missing or disabled, exclude user
          continue;
        }

        // Create or get recipient record (idempotently)
        let recipient = await NotificationRecipientModel.findOne({
          notificationId: notification._id,
          userId: user._id,
        });

        if (!recipient) {
          try {
            recipient = await NotificationRecipientModel.create({
              notificationId: notification._id,
              userId: user._id,
              suburbId,
              status: NotificationRecipientStatus.PENDING,
            });
          } catch (createErr: any) {
            if (createErr.code === 11000) {
              recipient = await NotificationRecipientModel.findOne({
                notificationId: notification._id,
                userId: user._id,
              });
            } else {
              throw createErr;
            }
          }
        }

        if (recipient && recipient.status !== NotificationRecipientStatus.SENT) {
          eligibleRecipients.push({
            _id: recipient._id,
            userId: user._id,
          });
        }
      }

      // 5. Broadcast to eligible recipients
      if (eligibleRecipients.length > 0) {
        await messageBroadcastingService.broadcastToRecipients(
          notification._id.toString(),
          notification.title,
          notification.message,
          eligibleRecipients,
          "IN_APP",
        );
      }
    }
  }
}

export default new ApproveBundleService();
