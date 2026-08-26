import { IInputIBundleUserMappingStatusPayloadStrict } from "../payloads/bundle-user-mapping-status-payload";

export interface IBundleUserMappingStatusDTO {
  title: string;
  label: string;
  color: string;
  is_default?: boolean;
}

export function toBundleUserMappingStatusDTO(
  body: IInputIBundleUserMappingStatusPayloadStrict,
): IBundleUserMappingStatusDTO {
  return {
    title: body.title?.trim(),
    label: body.label?.trim()?.toLowerCase(),
    color: body.color?.trim(),
    is_default: body.is_default,
  };
}
