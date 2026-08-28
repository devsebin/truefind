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

const documentResponse = (doc: any) =>
  doc && typeof doc === "object" && "_id" in doc
    ? {
      id: doc._id,
      url: doc.url,
      document_type: doc.document_type,
      file_name: doc.file_name,
      content_type: doc.content_type,
    }
    : doc;

const statusResponse = (status: any) =>
  status && typeof status === "object" && "_id" in status
    ? {
      id: status._id,
      title: status.title,
      label: status.label,
      color: status.color,
      description: status.description,
      is_default: status.is_default,
    }
    : status;

const serviceItemResponse = (item: any) => {
  if (!item) return null;

  const service = item.service_id && typeof item.service_id === "object" && "_id" in item.service_id
    ? {
        id: item.service_id._id,
        name: item.service_id.name,
        code: item.service_id.code,
        description: item.service_id.description,
        icon: item.service_id.icon,
        status: item.service_id.status_id,
        is_active: item.service_id.is_active,
        is_deleted: item.service_id.is_deleted,
      }
    : item.service_id;

  return {
    id: item._id,
    service,
    sort_order: item.sort_order,
    quantity: item.quantity,
    is_mandatory: item.is_mandatory,
    is_included: item.is_included,
    service_name_snapshot: item.service_name_snapshot,
    service_code_snapshot: item.service_code_snapshot,
    metadata: item.metadata,
    is_active: item.is_active,
    is_deleted: item.is_deleted,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
};

export const bundleResponse = (bundle: any, services: any[] = []): any => {
  const serviceItems = services.length > 0
    ? services
    : (Array.isArray(bundle?.services) ? bundle.services : []);

  return {
    id: bundle._id,
    name: bundle.name,
    display_name: bundle.display_name,
    code: bundle.code,
    description: bundle.description,
    icon: documentResponse(bundle.icon),
    status_id: statusResponse(bundle.status_id),
    sort_order: bundle.sort_order,
    tags: bundle.tags,
    metadata: bundle.metadata,
    services: serviceItems.map((item: any) => serviceItemResponse(item)).filter(Boolean),
    is_active: bundle.is_active,
    is_deleted: bundle.is_deleted,

    created_by: userResponse(bundle.created_by),
    updated_by: userResponse(bundle.updated_by),
    deleted_by: userResponse(bundle.deleted_by),

    created_at: bundle.createdAt,
    updated_at: bundle.updatedAt,
    deleted_at: bundle.deleted_at,
  };
};

export const bundleListResponse = (
  data: any,
  servicesMap: Record<string, any[]> = {},
): any =>
  data?.map((item: any) => {
    const bundleIdStr = item._id?.toString();
    const services = servicesMap[bundleIdStr] || item.services || [];
    return bundleResponse(item, services);
  }) ?? [];

export const bundleErrorResponse = (bundle: any): any => ({
  id: bundle._id,
  name: bundle.name,
  code: bundle.code,
  is_active: bundle.is_active,
  is_deleted: bundle.is_deleted,
});

