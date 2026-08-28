import {
  BroadcastChannel,
  IBroadcastHandler,
} from "../interfaces/broadcasting.interface";

export class BroadcastRegistry {
  private static registry = new Map<BroadcastChannel, IBroadcastHandler>();

  static register(channel: BroadcastChannel, handler: IBroadcastHandler) {
    this.registry.set(channel, handler);
  }

  static get(channel: BroadcastChannel): IBroadcastHandler | undefined {
    return this.registry.get(channel);
  }

  static getAll(): Map<BroadcastChannel, IBroadcastHandler> {
    return this.registry;
  }
}
