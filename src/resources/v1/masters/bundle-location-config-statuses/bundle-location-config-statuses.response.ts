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

export const bundleLocationConfigStatusesResponse = (
  bundleLocationConfigStatus: any,
): any => ({
  id: bundleLocationConfigStatus._id,
  title: bundleLocationConfigStatus.title,
  label: bundleLocationConfigStatus.label,
  color: bundleLocationConfigStatus.color,
  is_default: bundleLocationConfigStatus.is_default,
  is_active: bundleLocationConfigStatus.is_active,
  is_deleted: bundleLocationConfigStatus.is_deleted,

  created_by: userResponse(bundleLocationConfigStatus.created_by),
  updated_by: userResponse(bundleLocationConfigStatus.updated_by),
  deleted_by: userResponse(bundleLocationConfigStatus.deleted_by),

  created_at: bundleLocationConfigStatus.createdAt,
  updated_at: bundleLocationConfigStatus.updatedAt,
  deleted_at: bundleLocationConfigStatus.deleted_at,
});

export const bundleLocationConfigStatusesListResponse = (data: any): any =>
  data?.map((item: any) => bundleLocationConfigStatusesResponse(item)) ?? [];

export const bundleLocationConfigStatusesErrorResponse = (
  bundleLocationConfigStatus: any,
): any => ({
  id: bundleLocationConfigStatus._id,
  title: bundleLocationConfigStatus.title,
  label: bundleLocationConfigStatus.label,
  is_active: bundleLocationConfigStatus.is_active,
  is_deleted: bundleLocationConfigStatus.is_deleted,
});
