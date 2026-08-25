import { IInputIServiceStatusesPayloadStrict } from "../payloads/service-statuses-payload";

export interface IServiceStatusesDTO {
  title: string;
  label: string;
  color: string;
  is_default?: boolean;
}

export function toServiceStatusesDTO(
  body: IInputIServiceStatusesPayloadStrict,
): IServiceStatusesDTO {
  return {
    title: body.title?.trim(),
    label: body.label?.trim()?.toLowerCase(),
    color: body.color?.trim(),
    is_default: body.is_default,
  };
}
