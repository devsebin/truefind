import { BroadcastRegistry } from "./registry/broadcasting.registry";
import { InAppNotificationHandler } from "./handlers/in-app-notification.handler";

BroadcastRegistry.register("IN_APP", new InAppNotificationHandler());
