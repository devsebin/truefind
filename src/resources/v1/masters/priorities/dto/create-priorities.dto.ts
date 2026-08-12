import { IInputIPrioritiesPayloadStrict } from "../payloads/priorities-payload";

export interface IPrioritiesDTO {
    title: string;
    label: string;
    color: string;
    is_default?: boolean;
}

export function toPrioritiesDTO(body: IInputIPrioritiesPayloadStrict): IPrioritiesDTO {
    return {
        title: body.title?.trim(),
        label: body.label?.trim()?.toLowerCase(),
        color: body.color?.trim(),
        is_default: body.is_default,
    };
}
