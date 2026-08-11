import { IInputDeclaimerPayloadStrict } from "../payloads/declaimer-payload";

export interface IDeclaimerDTO {
  key: string;
  title: string;
  content: string;
  language: string;
  country: string | null;
  metadata?: Record<string, any>;
}

export function toDeclaimerDTO(body: IInputDeclaimerPayloadStrict): IDeclaimerDTO {
  return {
    key: body.key.trim().toLowerCase(),
    title: body.title.trim(),
    content: body.content.trim(),
    language: body.language ? body.language.trim().toLowerCase() : "en",
    country: body.country ? body.country.toString() : null,
    metadata: body.metadata,
  };
}
