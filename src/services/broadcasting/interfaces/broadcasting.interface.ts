export type BroadcastChannel = "IN_APP" | "PUSH" | "EMAIL" | "SMS";

export interface IBroadcastPayload {
  notificationId: string;
  recipientId: string;
  userId: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  channel?: BroadcastChannel;
}

export interface IBroadcastResult {
  success: boolean;
  message: string;
  channel: BroadcastChannel;
  data?: any;
  error?: string;
}

export interface IBroadcastHandler {
  send(payload: IBroadcastPayload): Promise<IBroadcastResult>;
}
