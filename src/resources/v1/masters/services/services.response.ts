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

export const serviceResponse = (service: any): any => {
  if (!service) return null;

  return {
    id: service._id,
    name: service.name,
    type: service.type,
    description: service.description,
    child_count: service.children?.length ?? 0,
    icon: service.icon,

    children: service.children?.map((child: any) => {
      if (child && typeof child === "object" && child._id) {
        return serviceResponse(child);
      }
      return child;
    }) ?? [],

    // Task/Service specific fields
    requiredLicenses: service.requiredLicenses,
    is_callout_service: service.is_callout_service,
    is_fixed_price: service.is_fixed_price,
    task_unit: service.task_unit,
    task_unit_price: service.task_unit_price,
    maximum_unit_price: service.maximum_unit_price,
    minimum_unit_price: service.minimum_unit_price,
    estimated_time: service.estimated_time,
    estimated_time_unit: service.estimated_time_unit,
    priority_id: service.priority_id,

    is_active: service.is_active,
    is_deleted: service.is_deleted,

    created_by: userResponse(service.created_by),
    updated_by: userResponse(service.updated_by),
    deleted_by: userResponse(service.deleted_by),

    created_at: service.createdAt,
    updated_at: service.updatedAt,
    deleted_at: service.deleted_at,
  };
};

export const serviceListResponse = (data: any): any =>
  data?.map((service: any) => serviceResponse(service)) ?? [];
