import IDocumentType from "@/database/document-types/document-types-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputDocumentTypesPayload extends Partial<IDocumentType> { }

export interface IInputIDocumentTypesPayloadStrict extends Strict<
  Partial<IDocumentType> &
  Required<
    Pick<
      IDocumentType,
      | "title"
      | "label"
      | "color"
    >
  >
> { }
