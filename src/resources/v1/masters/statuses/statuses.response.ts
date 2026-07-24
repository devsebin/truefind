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

export const statusResponse = (status: any): any => ({
  id: status._id,
  title: status.title,
  color: status.color,
  label: status.label,
  is_active: status.is_active,
  is_deleted: status.is_deleted,

  created_by: userResponse(status.created_by),

  updated_by: userResponse(status.updated_by),

  deleted_by: userResponse(status.deleted_by),

  created_at: status.createdAt,
  updated_at: status.updatedAt,
  deleted_at: status.deleted_at,
});

export const statusListResponse = (data: any): any =>
  data?.map((status: any) => statusResponse(status)) ?? [];

export const statusErrorResponse = (status: any): any => ({
  id: status._id,
  title: status.title,
  color: status.color,
  label: status.label,
  is_active: status.is_active,
  is_deleted: status.is_deleted,
});
