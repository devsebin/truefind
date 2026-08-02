import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../providers.helper";
import { HandlerRegistry } from "./handler.registry";
import { IPayloadMap, MessageType } from "./payload.interface";
import { IMessageHandler, ITestProviderResult } from "./test-support.interface";

export class ProviderFactory {
  static getHandler<T extends MessageType>(
    provider: ITestProviderResult,
  ): IMessageHandler<T> {
    const { name, config, supportedCountry } = provider;

    const typeName = supportedCountry.type.name as T;
    const countryCode = supportedCountry.countryCode;

    const HandlerClass = HandlerRegistry.get(name, countryCode, typeName);

    return new HandlerClass(config);
  }
}

type BuilderFn<T extends MessageType> = (input: any) => IPayloadMap[T];

export class PayloadBuilder {
  private static builders: {
    [K in MessageType]: BuilderFn<K>;
  } = {
      SMS: (input) => ({
        phone: input.phone,
        message: input.message,
      }),

      WHATSAPP: (input) => ({
        phone: input.phone,
        templateId: input.templateId,
        variables: input.variables,
      }),

      EMAIL: (input) => ({
        to: input.email,
        subject: input.subject,
        body: input.body,
      }),
    };

  static build<T extends MessageType>(type: T, input: any): IPayloadMap[T] {
    const builder = this.builders[type];

    if (!builder) {
      const response = ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
        message: `Unsupported message type: ${type}`,
      });
      throwError("unsupported_message_type", response);
    }

    return builder(input);
  }
}
