import { IInputIBundleLocationConfigStatusesPayloadStrict } from "../payloads/bundle-location-config-statuses-payload";

export interface IBundleLocationConfigStatusesDTO {
  title: string;
  label: string;
  color: string;
  is_default?: boolean;
}

export function toBundleLocationConfigStatusesDTO(
  body: IInputIBundleLocationConfigStatusesPayloadStrict,
): IBundleLocationConfigStatusesDTO {
  return {
    title: body.title?.trim(),
    label: body.label?.trim()?.toLowerCase(),
    color: body.color?.trim(),
    is_default: body.is_default,
  };
}
