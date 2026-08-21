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

export const documentTypesResponse = (documentType: any): any => ({
    id: documentType._id,
    title: documentType.title,
    label: documentType.label,
    color: documentType.color,
    is_default: documentType.is_default,
    is_active: documentType.is_active,
    is_deleted: documentType.is_deleted,

    created_by: userResponse(documentType.created_by),
    updated_by: userResponse(documentType.updated_by),
    deleted_by: userResponse(documentType.deleted_by),

    created_at: documentType.createdAt,
    updated_at: documentType.updatedAt,
    deleted_at: documentType.deleted_at,
});

export const documentTypesListResponse = (data: any): any =>
    data?.map((item: any) => documentTypesResponse(item)) ?? [];

export const documentTypesErrorResponse = (documentType: any): any => ({
    id: documentType._id,
    title: documentType.title,
    label: documentType.label,
    is_active: documentType.is_active,
    is_deleted: documentType.is_deleted,
});
