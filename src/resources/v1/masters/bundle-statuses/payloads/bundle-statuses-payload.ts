import { IBundleStatus } from "@/database/bundle-statuses/bundle-statuses-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputBundleStatusPayload extends Partial<IBundleStatus> {}

export interface IInputIBundleStatusesPayloadStrict
  extends Strict<
    Partial<IBundleStatus> &
      Required<Pick<IBundleStatus, "title" | "label" | "color">>
  > {}
