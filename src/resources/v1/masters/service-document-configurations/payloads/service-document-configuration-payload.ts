import { IRequiredDocument, IServiceDocumentConfiguration } from "@/database/service-document-configuration/service-document-configuration-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputServiceDocumentConfigurationPayload extends Partial<IServiceDocumentConfiguration> {}

export interface IInputServiceDocumentConfigurationPayloadStrict extends Strict<
  Partial<IServiceDocumentConfiguration> &
  Required<Pick<IServiceDocumentConfiguration, "service_id" | "required_documents">>
> {}
