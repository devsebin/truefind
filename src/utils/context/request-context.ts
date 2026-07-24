import { AsyncLocalStorage } from "async_hooks";

export interface RequestStore {
  userId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestStore>();

/**
 * Safely fetches the active user ID from the request context.
 */
export function getContextUserId(): string | null {
  const store = requestContext.getStore();
  return store?.userId ? store.userId : null;
}
