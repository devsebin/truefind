import { IServiceDocumentRequirements } from "@/database/service-documents/service-documents-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

/**
 * Base payload (all fields optional, strictly from IServiceDocumentRequirements)
 */
export interface IInputServiceDocumentPayload extends Partial<IServiceDocumentRequirements> { }

/**
 * Strict payload for creation
 */
export interface IInputServiceDocumentPayloadStrict extends Strict<
  Partial<IServiceDocumentRequirements> &
  Required<
    Pick<
      IServiceDocumentRequirements,
      | "name"
      | "display_name"
      | "item_code"
      | "document_type_id"
      | "max_file_size"
      | "accepted_mimeTypes"
    >
  >
> { }

/**
 * Strict payload for update
 */
export interface IUpdateServiceDocumentPayloadStrict extends Strict<
  Partial<IServiceDocumentRequirements>
> { }
