import mongoose from "mongoose";
import { IPayloadMap, MessageType } from "./payload.interface";

export interface IMessageHandler<T extends MessageType> {
  sendMessage(payload: IPayloadMap[T]): Promise<any>;
}

export interface ITestResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface ITestProviderResult {
  name: string;
  config: {
    apiKey?: string;
    apiSecret?: string;
    senderId?: string;
  };
  supportedCountry: {
    countryId: mongoose.Types.ObjectId;
    countryCode: string;
    type: {
      _id: mongoose.Types.ObjectId;
      name: MessageType;
      payloadSchema: any; // ✅ FIXED
    };
  };
}
