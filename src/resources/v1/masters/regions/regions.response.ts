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

const countryResponse = (country: any) =>
    country
        ? {
            id: country._id,
            name: country.name,
            iso_code: country.iso_code,
        }
        : null;

export const regionResponse = (region: any): any => ({
    id: region._id,
    name: region.name,
    code: region.code,
    country: countryResponse(region.country_id),
    is_active: region.is_active,
    is_deleted: region.is_deleted,

    created_by: userResponse(region.created_by),
    updated_by: userResponse(region.updated_by),
    deleted_by: userResponse(region.deleted_by),

    created_at: region.createdAt,
    updated_at: region.updatedAt,
    deleted_at: region.deleted_at,
});

export const regionListResponse = (data: any): any =>
    data?.map((region: any) => regionResponse(region)) ?? [];

export const regionErrorResponse = (region: any): any => ({
    id: region._id,
    name: region.name,
    code: region.code,
    is_active: region.is_active,
    is_deleted: region.is_deleted,
});
