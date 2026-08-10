import { ISmsPayload } from "../support/payload.interface";
import {
  IMessageHandler,
  ITestResult,
} from "../support/test-support.interface";

export class TwilioSmsHandler implements IMessageHandler<"SMS"> {
  constructor(private config: any) { }

  async sendMessage(payload: ISmsPayload): Promise<ITestResult> {
    console.log("Twilio SMS is done:", payload.phone, payload.message);

    return { success: true, message: "SMS sent successfully", data: null }; // Placeholder for async behavior, replace with actual Twilio API call
    // integrate actual Twilio here
  }
}
