import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../providers.helper";
import { MessageType } from "./payload.interface";
import { IMessageHandler } from "./test-support.interface";

type HandlerKey = `${string}:${string}:${MessageType}`;

export class HandlerRegistry {
  private static registry = new Map<HandlerKey, any>();

  static register<T extends MessageType>(
    provider: string,
    country: string,
    type: T,
    handler: new (config: any) => IMessageHandler<T>,
  ) {
    const key: HandlerKey = `${provider}:${country}:${type}`;
    this.registry.set(key, handler);
  }

  static get<T extends MessageType>(
    provider: string,
    country: string,
    type: T,
  ): new (config: any) => IMessageHandler<T> {
    const key: HandlerKey = `${provider}:${country}:${type}`;
    const fallbackKey: HandlerKey = `${provider}:DEFAULT:${type}`;

    const handler = this.registry.get(key) || this.registry.get(fallbackKey);

    if (!handler) {
      const responseMessage = ResponseBuilder.error(ErrorTypes.NOT_FOUND, {
        message: "Handler not found",
        data: {
          providerId: provider,
          countryId: country,
          type: type,
        },
      });
      throwError("handler_not_found", responseMessage);
    }

    return handler;
  }
}
