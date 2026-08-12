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

export const prioritiesResponse = (priority: any): any => ({
    id: priority._id,
    title: priority.title,
    label: priority.label,
    color: priority.color,
    is_default: priority.is_default,
    is_active: priority.is_active,
    is_deleted: priority.is_deleted,

    created_by: userResponse(priority.created_by),
    updated_by: userResponse(priority.updated_by),
    deleted_by: userResponse(priority.deleted_by),

    created_at: priority.createdAt,
    updated_at: priority.updatedAt,
    deleted_at: priority.deleted_at,
});

export const prioritiesListResponse = (data: any): any =>
    data?.map((priority: any) => prioritiesResponse(priority)) ?? [];

export const prioritiesErrorResponse = (priority: any): any => ({
    id: priority._id,
    title: priority.title,
    label: priority.label,
    is_active: priority.is_active,
    is_deleted: priority.is_deleted,
});
