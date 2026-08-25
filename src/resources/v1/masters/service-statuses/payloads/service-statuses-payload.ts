import { IServiceStatus } from "@/database/service-status/service-status-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputServiceStatusPayload extends Partial<IServiceStatus> {}

export interface IInputIServiceStatusesPayloadStrict
  extends Strict<
    Partial<IServiceStatus> &
      Required<Pick<IServiceStatus, "title" | "label" | "color">>
  > {}
