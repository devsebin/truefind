import mongoose from "mongoose";

export interface IBundleServiceItemDTO {
  bundle_id: mongoose.Types.ObjectId;
  service_id: mongoose.Types.ObjectId;
  sort_order?: number;
  quantity?: number;
  is_mandatory?: boolean;
  is_included?: boolean;
  service_name_snapshot?: string;
  service_code_snapshot?: string;
  metadata?: Record<string, unknown>;
  is_active?: boolean;
}

export function toBundleServiceItemDTO(body: any): IBundleServiceItemDTO {
  return {
    bundle_id: new mongoose.Types.ObjectId(body.bundle_id),
    service_id: new mongoose.Types.ObjectId(body.service_id),
    sort_order:
      body.sort_order !== undefined ? Number(body.sort_order) : undefined,
    quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
    is_mandatory:
      body.is_mandatory !== undefined ? Boolean(body.is_mandatory) : undefined,
    is_included:
      body.is_included !== undefined ? Boolean(body.is_included) : undefined,
    service_name_snapshot: body.service_name_snapshot ?? undefined,
    service_code_snapshot: body.service_code_snapshot ?? undefined,
    metadata: body.metadata ?? undefined,
    is_active: body.is_active !== undefined ? Boolean(body.is_active) : undefined,
  };
}
