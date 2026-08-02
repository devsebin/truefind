export type MessageType = "SMS" | "WHATSAPP" | "EMAIL";

export interface ISmsPayload {
  phone: string;
  message: string;
}

export interface IWhatsAppPayload {
  phone: string;
  templateId: string;
  variables?: Record<string, string>;
}

export interface IEmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface IPayloadMap {
  SMS: ISmsPayload;
  WHATSAPP: IWhatsAppPayload;
  EMAIL: IEmailPayload;
}
