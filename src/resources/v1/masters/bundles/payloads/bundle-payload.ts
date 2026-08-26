import { IBundleDocument } from "@/database/bundles/bundles-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputBundlePayload extends Partial<IBundleDocument> {}

export interface IInputIBundlesPayloadStrict
  extends Strict<
    Partial<IBundleDocument> &
      Required<Pick<IBundleDocument, "name" | "display_name" | "code" | "icon">>
  > {}
