import { IDeclaimer } from "@/database/declaimers/declaimers-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputDeclaimerPayload extends Partial<IDeclaimer> {}

export interface IInputDeclaimerPayloadStrict extends Strict<
  Partial<IDeclaimer> &
  Required<
    Pick<
      IDeclaimer,
      | "key"
      | "title"
      | "content"
      | "language"
      | "country"
    >
  >
> {}

export interface IUpdateDeclaimerPayloadStrict extends Strict<
  Partial<IDeclaimer> &
  Required<
    Pick<
      IDeclaimer,
      | "title"
      | "content"
    >
  >
> {}
