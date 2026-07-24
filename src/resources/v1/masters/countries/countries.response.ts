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

const regionResponse = (region: any) =>
    region
        ? {
            id: region._id,
            name: region.name,
            code: region.code,
        }
        : null;

export const countryResponse = (country: any): any => ({
    id: country._id,
    name: country.name,
    iso_code: country.iso_code,
    iso_code_3: country.iso_code_3,
    code: country.code,
    phone_code: country.phone_code,
    currency: country.currency,
    continent: country.continent,
    timezone: country.timezone,
    regions: country.region_ids?.map((region: any) => regionResponse(region)) ?? [],
    flags: country.flags,
    providers: country.providers,
    is_active: country.is_active,
    is_deleted: country.is_deleted,

    created_by: userResponse(country.created_by),
    updated_by: userResponse(country.updated_by),
    deleted_by: userResponse(country.deleted_by),

    created_at: country.createdAt,
    updated_at: country.updatedAt,
    deleted_at: country.deleted_at,
});

export const countryListResponse = (data: any): any =>
    data?.map((country: any) => {
        const res = countryResponse(country);
        res.regions = country.region_ids?.length ?? 0;
        // delete res.regions;
        return res;
    }) ?? [];

export const countryErrorResponse = (country: any): any => ({
    id: country._id,
    name: country.name,
    iso_code: country.iso_code,
    is_active: country.is_active,
    is_deleted: country.is_deleted,
});
