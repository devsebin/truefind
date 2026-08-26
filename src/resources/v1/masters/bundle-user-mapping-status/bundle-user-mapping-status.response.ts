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

export const bundleUserMappingStatusResponse = (bundleUserMappingStatus: any): any => ({
  id: bundleUserMappingStatus._id,
  title: bundleUserMappingStatus.title,
  label: bundleUserMappingStatus.label,
  color: bundleUserMappingStatus.color,
  is_default: bundleUserMappingStatus.is_default,
  is_active: bundleUserMappingStatus.is_active,
  is_deleted: bundleUserMappingStatus.is_deleted,

  created_by: userResponse(bundleUserMappingStatus.created_by),
  updated_by: userResponse(bundleUserMappingStatus.updated_by),
  deleted_by: userResponse(bundleUserMappingStatus.deleted_by),

  created_at: bundleUserMappingStatus.createdAt,
  updated_at: bundleUserMappingStatus.updatedAt,
  deleted_at: bundleUserMappingStatus.deleted_at,
});

export const bundleUserMappingStatusListResponse = (data: any): any =>
  data?.map((item: any) => bundleUserMappingStatusResponse(item)) ?? [];

export const bundleUserMappingStatusErrorResponse = (bundleUserMappingStatus: any): any => ({
  id: bundleUserMappingStatus._id,
  title: bundleUserMappingStatus.title,
  label: bundleUserMappingStatus.label,
  is_active: bundleUserMappingStatus.is_active,
  is_deleted: bundleUserMappingStatus.is_deleted,
});
