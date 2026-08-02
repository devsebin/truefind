import { IEmailPayload, ISmsPayload } from "../support/payload.interface";
import {
  IMessageHandler,
  ITestResult,
} from "../support/test-support.interface";

export class TwilioEmailHandler implements IMessageHandler<"EMAIL"> {
  constructor(private config: any) { }

  async sendMessage(payload: IEmailPayload): Promise<ITestResult> {
    console.log("Twilio Email:", payload.to, payload.subject, payload.body);

    return { success: true, message: "Email sent successfully", data: null }; // Placeholder for async behavior, replace with actual Twilio API call
    // integrate actual Twilio here
  }
}
