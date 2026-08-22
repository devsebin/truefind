import { IInputIDocumentTypesPayloadStrict } from "../payloads/document-types-payload";

export interface IDocumentTypesDTO {
    title: string;
    label: string;
    color: string;
    is_default?: boolean;
}

export function toDocumentTypesDTO(body: IInputIDocumentTypesPayloadStrict): IDocumentTypesDTO {
    return {
        title: body.title?.trim().toUpperCase(),
        label: body.label?.trim()?.toLowerCase(),
        color: body.color?.trim(),
        is_default: body.is_default,
    };
}
