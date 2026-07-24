import capitalize from "../helpers/capitalize-string.helper";
import generateLabel from "../helpers/generate-label.helper";
import { IInputStatusPayloadStrict } from "../payloads/create-status.payload";

export interface IStatusDTO {
    title: string;
    color: string;
    label: string;
}
export function toStatusDTO(body: IInputStatusPayloadStrict): IStatusDTO {
    return {
        title: capitalize(body.title),
        color: body.color,
        label: generateLabel(body.title),
    };
}
