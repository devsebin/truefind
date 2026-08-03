import { TwilioEmailHandler } from "../handlers/twilio.email.handler";
import { TwilioSmsHandler } from "../handlers/twilio.sms.handler";
import { HandlerRegistry } from "./handler.registry";

HandlerRegistry.register("TWILIO PROVIDER-1", "NZ", "SMS", TwilioSmsHandler);
HandlerRegistry.register("TWILIO PROVIDER-1", "IN", "SMS", TwilioSmsHandler);
// fallback
HandlerRegistry.register("Twilio Provider", "DEFAULT", "SMS", TwilioSmsHandler);
