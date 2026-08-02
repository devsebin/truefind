import { TwilioEmailHandler } from "../handlers/twilio.email.handler";
import { TwilioSmsHandler } from "../handlers/twilio.sms.handler";
import { HandlerRegistry } from "./handler.registry";

HandlerRegistry.register("Twilio Provider", "NZ", "SMS", TwilioSmsHandler);
HandlerRegistry.register("Twilio Provider", "US", "EMAIL", TwilioEmailHandler);

// fallback
HandlerRegistry.register("Twilio Provider", "DEFAULT", "SMS", TwilioSmsHandler);
