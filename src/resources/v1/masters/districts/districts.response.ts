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

const regionResponse = (region: any) =>
    region
        ? {
            id: region._id,
            name: region.name,
            code: region.code,
        }
        : null;

export const districtResponse = (district: any): any => ({
    id: district._id,
    name: district.name,
    code: district.code,
    country: countryResponse(district.country_id),
    region: regionResponse(district.region_id),
    is_active: district.is_active,
    is_deleted: district.is_deleted,

    created_by: userResponse(district.created_by),
    updated_by: userResponse(district.updated_by),
    deleted_by: userResponse(district.deleted_by),

    created_at: district.createdAt,
    updated_at: district.updatedAt,
    deleted_at: district.deleted_at,
});

export const districtListResponse = (data: any): any =>
    data?.map((district: any) => districtResponse(district)) ?? [];

export const districtErrorResponse = (district: any): any => ({
    id: district._id,
    name: district.name,
    code: district.code,
    is_active: district.is_active,
    is_deleted: district.is_deleted,
});
