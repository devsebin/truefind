import { IBundleLocationConfigStatus } from "@/database/bundle-location-config-status/bundle-location-config-status-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputBundleLocationConfigStatusPayload
  extends Partial<IBundleLocationConfigStatus> {}

export interface IInputIBundleLocationConfigStatusesPayloadStrict
  extends Strict<
    Partial<IBundleLocationConfigStatus> &
      Required<
        Pick<IBundleLocationConfigStatus, "title" | "label" | "color">
      >
  > {}
