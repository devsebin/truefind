import { IInputIBundleStatusesPayloadStrict } from "../payloads/bundle-statuses-payload";

export interface IBundleStatusesDTO {
  title: string;
  label: string;
  color: string;
  is_default?: boolean;
}

export function toBundleStatusesDTO(
  body: IInputIBundleStatusesPayloadStrict,
): IBundleStatusesDTO {
  return {
    title: body.title?.trim(),
    label: body.label?.trim()?.toLowerCase(),
    color: body.color?.trim(),
    is_default: body.is_default,
  };
}
