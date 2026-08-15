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

export const rolesResponse = (role: any): any => ({
    id: role._id,
    title: role.title,
    label: role.label,
    dimension: role.dimension,
    color: role.color,
    is_default: role.is_default,
    is_active: role.is_active,
    is_deleted: role.is_deleted,

    created_by: userResponse(role.created_by),
    updated_by: userResponse(role.updated_by),
    deleted_by: userResponse(role.deleted_by),

    created_at: role.createdAt,
    updated_at: role.updatedAt,
    deleted_at: role.deleted_at,
});

export const rolesListResponse = (data: any): any =>
    data?.map((role: any) => rolesResponse(role)) ?? [];

export const rolesErrorResponse = (role: any): any => ({
    id: role._id,
    title: role.title,
    label: role.label,
    is_active: role.is_active,
    is_deleted: role.is_deleted,
});
