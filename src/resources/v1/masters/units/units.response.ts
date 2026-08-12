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

export const unitsResponse = (unit: any): any => ({
    id: unit._id,
    title: unit.title,
    label: unit.label,
    color: unit.color,
    is_default: unit.is_default,
    is_active: unit.is_active,
    is_deleted: unit.is_deleted,

    created_by: userResponse(unit.created_by),
    updated_by: userResponse(unit.updated_by),
    deleted_by: userResponse(unit.deleted_by),

    created_at: unit.createdAt,
    updated_at: unit.updatedAt,
    deleted_at: unit.deleted_at,
});

export const unitsListResponse = (data: any): any =>
    data?.map((unit: any) => unitsResponse(unit)) ?? [];

export const unitsErrorResponse = (unit: any): any => ({
    id: unit._id,
    title: unit.title,
    label: unit.label,
    is_active: unit.is_active,
    is_deleted: unit.is_deleted,
});
