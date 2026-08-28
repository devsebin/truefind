import { BroadcastRegistry } from "../registry/broadcasting.registry";
import {
  BroadcastChannel,
  IBroadcastPayload,
  IBroadcastResult,
} from "../interfaces/broadcasting.interface";
import NotificationRecipientModel from "@/database/notification-recipients/notification-recipients-db-model";
import { NotificationRecipientStatus } from "@/database/notification-recipients/notification-recipients-db-interface";

class MessageBroadcastingService {
  public async broadcast(
    payload: IBroadcastPayload,
    channel: BroadcastChannel = "IN_APP",
  ): Promise<IBroadcastResult> {
    const handler = BroadcastRegistry.get(channel);

    if (!handler) {
      const errorMsg = `No broadcasting handler registered for channel: ${channel}`;
      console.error(`[Broadcasting Error] ${errorMsg}`);

      if (payload.recipientId) {
        await NotificationRecipientModel.updateOne(
          { _id: payload.recipientId },
          {
            status: NotificationRecipientStatus.FAILED,
            failureReason: errorMsg,
          },
        );
      }

      return {
        success: false,
        channel,
        message: errorMsg,
        error: errorMsg,
      };
    }

    try {
      const result = await handler.send(payload);

      if (payload.recipientId) {
        if (result.success) {
          await NotificationRecipientModel.updateOne(
            { _id: payload.recipientId },
            {
              status: NotificationRecipientStatus.SENT,
              sentAt: new Date(),
              failureReason: null,
            },
          );
        } else {
          await NotificationRecipientModel.updateOne(
            { _id: payload.recipientId },
            {
              status: NotificationRecipientStatus.FAILED,
              failureReason: result.error || result.message,
            },
          );
        }
      }

      return result;
    } catch (error: any) {
      const errorMsg = error.message || "Unknown error during message broadcasting";
      console.error(`[Broadcasting Exception] ${errorMsg}`);

      if (payload.recipientId) {
        await NotificationRecipientModel.updateOne(
          { _id: payload.recipientId },
          {
            status: NotificationRecipientStatus.FAILED,
            failureReason: errorMsg,
          },
        );
      }

      return {
        success: false,
        channel,
        message: errorMsg,
        error: errorMsg,
      };
    }
  }

  public async broadcastToRecipients(
    notificationId: string,
    title: string,
    message: string,
    recipients: Array<{ _id: any; userId: any }>,
    channel: BroadcastChannel = "IN_APP",
  ): Promise<{ total: number; sent: number; failed: number }> {
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const result = await this.broadcast(
        {
          notificationId,
          recipientId: recipient._id.toString(),
          userId: recipient.userId.toString(),
          title,
          message,
          channel,
        },
        channel,
      );

      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
      }
    }

    return {
      total: recipients.length,
      sent: sentCount,
      failed: failedCount,
    };
  }
}

export default new MessageBroadcastingService();
