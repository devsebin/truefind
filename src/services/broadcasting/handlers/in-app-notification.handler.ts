import {
  IBroadcastHandler,
  IBroadcastPayload,
  IBroadcastResult,
} from "../interfaces/broadcasting.interface";

export class InAppNotificationHandler implements IBroadcastHandler {
  async send(payload: IBroadcastPayload): Promise<IBroadcastResult> {
    console.log(
      `[Broadcasting] IN_APP notification delivered to user ${payload.userId}: "${payload.title}"`,
    );

    return {
      success: true,
      channel: "IN_APP",
      message: "In-app notification delivered successfully",
      data: {
        userId: payload.userId,
        notificationId: payload.notificationId,
      },
    };
  }
}
