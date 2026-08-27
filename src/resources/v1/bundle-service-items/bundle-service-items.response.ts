const userResponse = (user: any) =>
  user
    ? {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      }
    : null;

const statusResponse = (status: any) =>
  status
    ? {
        id: status._id,
        title: status.title,
        label: status.label,
        color: status.color,
        is_default: status.is_default,
      }
    : null;

const bundleResponse = (bundle: any) =>
  bundle
    ? {
        id: bundle._id,
        name: bundle.name,
        display_name: bundle.display_name,
        code: bundle.code,
        description: bundle.description,
        status: statusResponse(bundle.status_id),
        is_active: bundle.is_active,
      }
    : null;

const serviceResponse = (service: any) =>
  service
    ? {
        id: service._id,
        name: service.name,
        code: service.code,
        description: service.description,
        is_active: service.is_active,
        is_deleted: service.is_deleted,
      }
    : null;

export const bundleServiceItemResponse = (item: any): any => {
  if (!item) return null;

  return {
    id: item._id,
    bundle: bundleResponse(item.bundle_id),
    service: serviceResponse(item.service_id),
    sort_order: item.sort_order,
    quantity: item.quantity,
    is_mandatory: item.is_mandatory,
    is_included: item.is_included,
    service_name_snapshot: item.service_name_snapshot,
    service_code_snapshot: item.service_code_snapshot,
    metadata: item.metadata,
    is_active: item.is_active,
    is_deleted: item.is_deleted,

    created_by: userResponse(item.created_by),
    updated_by: userResponse(item.updated_by),
    deleted_by: userResponse(item.deleted_by),

    created_at: item.createdAt,
    updated_at: item.updatedAt,
    deleted_at: item.deleted_at,
  };
};

export const bundleServiceItemListResponse = (data: any): any =>
  data?.map((item: any) => bundleServiceItemResponse(item)) ?? [];
