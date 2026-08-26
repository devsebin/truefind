import mongoose, { Types } from "mongoose";
import { IInputIBundlesPayloadStrict } from "../payloads/bundle-payload";

export interface IBundlesDTO {
  name: string;
  display_name: string;
  code: string;
  description?: string;
  icon: Types.ObjectId;
  status_id?: Types.ObjectId;
  sort_order?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export function toBundlesDTO(
  body: IInputIBundlesPayloadStrict,
): IBundlesDTO {
  return {
    name: body.name?.trim(),
    display_name: body.display_name?.trim(),
    code: body.code?.trim()?.toUpperCase(),
    description: body.description?.trim(),
    icon: new mongoose.Types.ObjectId(body.icon),
    status_id: body.status_id ? new mongoose.Types.ObjectId(body.status_id) : undefined,
    sort_order: body.sort_order ?? 0,
    tags: Array.isArray(body.tags) ? body.tags.map((t) => t.trim()) : [],
    metadata: body.metadata ?? {},
  };
}
