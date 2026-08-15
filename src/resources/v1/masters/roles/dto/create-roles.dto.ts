import { IInputIRolesPayloadStrict } from "../payloads/roles-payload";

export interface IRolesDTO {
    title: string;
    label: string;
    color: string;
}

export function toRolesDTO(body: IInputIRolesPayloadStrict): IRolesDTO {
    return {
        title: body.title.charAt(0).toUpperCase() + body.title.slice(1).toLowerCase().trim(),
        label: body.label?.trim()?.toLowerCase(),
        color: body.color?.trim(),
    };
}
