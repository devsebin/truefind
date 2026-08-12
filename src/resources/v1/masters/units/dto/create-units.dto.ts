import { IInputIUnitsPayloadStrict } from "../payloads/units-payload";

export interface IUnitsDTO {
    title: string;
    label: string;
    dimension: string;
    color: string;
    is_default?: boolean;
}

export function toUnitsDTO(body: IInputIUnitsPayloadStrict): IUnitsDTO {
    return {
        title: body.title?.trim(),
        label: body.label?.trim()?.toLowerCase(),
        dimension: body.dimension?.trim(),
        color: body.color?.trim(),
        is_default: body.is_default,
    };
}
