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

export const serviceStatusesResponse = (serviceStatus: any): any => ({
  id: serviceStatus._id,
  title: serviceStatus.title,
  label: serviceStatus.label,
  color: serviceStatus.color,
  is_default: serviceStatus.is_default,
  is_active: serviceStatus.is_active,
  is_deleted: serviceStatus.is_deleted,

  created_by: userResponse(serviceStatus.created_by),
  updated_by: userResponse(serviceStatus.updated_by),
  deleted_by: userResponse(serviceStatus.deleted_by),

  created_at: serviceStatus.createdAt,
  updated_at: serviceStatus.updatedAt,
  deleted_at: serviceStatus.deleted_at,
});

export const serviceStatusesListResponse = (data: any): any =>
  data?.map((item: any) => serviceStatusesResponse(item)) ?? [];

export const serviceStatusesErrorResponse = (serviceStatus: any): any => ({
  id: serviceStatus._id,
  title: serviceStatus.title,
  label: serviceStatus.label,
  is_active: serviceStatus.is_active,
  is_deleted: serviceStatus.is_deleted,
});
