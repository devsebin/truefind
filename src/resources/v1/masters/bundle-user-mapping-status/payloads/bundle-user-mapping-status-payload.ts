import { IBundleUserMappingStatus } from "@/database/bundle-user-mapping-status/bundle-user-mapping-status-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputBundleUserMappingStatusPayload
  extends Partial<IBundleUserMappingStatus> {}

export interface IInputIBundleUserMappingStatusPayloadStrict
  extends Strict<
    Partial<IBundleUserMappingStatus> &
      Required<Pick<IBundleUserMappingStatus, "title" | "label" | "color">>
  > {}
