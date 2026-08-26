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

export const bundleStatusesResponse = (bundleStatus: any): any => ({
  id: bundleStatus._id,
  title: bundleStatus.title,
  label: bundleStatus.label,
  color: bundleStatus.color,
  is_default: bundleStatus.is_default,
  is_active: bundleStatus.is_active,
  is_deleted: bundleStatus.is_deleted,

  created_by: userResponse(bundleStatus.created_by),
  updated_by: userResponse(bundleStatus.updated_by),
  deleted_by: userResponse(bundleStatus.deleted_by),

  created_at: bundleStatus.createdAt,
  updated_at: bundleStatus.updatedAt,
  deleted_at: bundleStatus.deleted_at,
});

export const bundleStatusesListResponse = (data: any): any =>
  data?.map((item: any) => bundleStatusesResponse(item)) ?? [];

export const bundleStatusesErrorResponse = (bundleStatus: any): any => ({
  id: bundleStatus._id,
  title: bundleStatus.title,
  label: bundleStatus.label,
  is_active: bundleStatus.is_active,
  is_deleted: bundleStatus.is_deleted,
});
