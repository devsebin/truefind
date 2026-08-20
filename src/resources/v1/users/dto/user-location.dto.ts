export interface IUserLocationDTO {
    country: string;
    countryCode: string;
    region: string;
    regionCode: string;
    district: string | null;
    city: string;
    formattedAddress: string;
    region_id?: string;
    country_id?: string;
}

export function toUserLocationDTO(data: any): IUserLocationDTO {
    return {
        country: data.country || "",
        countryCode: data.countryCode || "",
        region: data.region || "",
        regionCode: data.regionCode || "",
        district: data.district || null,
        city: data.city || "",
        formattedAddress: data.formattedAddress || "",
        region_id: data.region_id,
        country_id: data.country_id,
    };
}
