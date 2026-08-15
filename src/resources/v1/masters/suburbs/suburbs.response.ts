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

const districtResponse = (district: any) =>
    district
        ? {
            id: district._id,
            name: district.name,
            code: district.code,
        }
        : null;

export const suburbResponse = (suburb: any): any => ({
    id: suburb._id,
    name: suburb.name,
    code: suburb.code,
    post_code: suburb.post_code,
    boundary: suburb.boundary,
    country: countryResponse(suburb.country_id),
    region: regionResponse(suburb.region_id),
    district: districtResponse(suburb.district_id),
    is_active: suburb.is_active,
    is_deleted: suburb.is_deleted,

    created_by: userResponse(suburb.created_by),
    updated_by: userResponse(suburb.updated_by),
    deleted_by: userResponse(suburb.deleted_by),

    created_at: suburb.createdAt,
    updated_at: suburb.updatedAt,
    deleted_at: suburb.deleted_at,
});

export const suburbListResponse = (data: any): any =>
    data?.map((suburb: any) => suburbResponse(suburb)) ?? [];

export const suburbErrorResponse = (suburb: any): any => ({
    id: suburb._id,
    name: suburb.name,
    code: suburb.code,
    is_active: suburb.is_active,
    is_deleted: suburb.is_deleted,
});
