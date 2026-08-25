import { title } from "node:process";

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

const serviceResponse = (service: any) =>
  service
    ? {
      name: service.name,
      type: service.type,
      description: service.description,
      is_active: service.is_active,
      estimated_time: service.estimated_time,
      estimated_time_unit: service.estimated_time_unit,
    }
    : null;

const countryResponse = (country: any) =>
  country
    ? {
      name: country.name,
      iso_code: country.iso_code,
      iso_code_3: country.iso_code_3,
      providers: country.providers.map((provider: any) => providerResponse(provider.provider_id)),
    }
    : null;

const currencyResponse = (currency: any) =>
  currency
    ? {
      title: currency.title,
      label: currency.label,
      code: currency.code,
    }
    : null;

const unitResponse = (unit: any) =>
  unit
    ? {
      title: unit.title,
      label: unit.label,
      dimension: unit.dimension,
      color: unit.color,

    }
    : null;

const providerResponse = (provider: any) =>
  provider
    ? {
      name: provider.name,
      is_active: provider.is_active,
      is_deleted: provider.is_deleted,
      is_default: provider.is_default
    }
    : null;

export const serviceCountryConfigResponse = (config: any): any => {
  if (!config) return null;

  return {
    id: config._id,
    service: serviceResponse(config.service_id),
    country: countryResponse(config.country_id),
    required_licenses: config.required_licenses,
    is_callout_service: config.is_callout_service,
    is_fixed_price: config.is_fixed_price,
    currency: currencyResponse(config.currency_id),
    price: config.price,
    unit: unitResponse(config.unit_id),
    minimum_unit_price: config.minimum_unit_price,
    maximum_unit_price: config.maximum_unit_price,
    call_out_fee: config.call_out_fee,
    estimated_time: config.estimated_time,
    estimated_time_unit: config.estimated_time_unit,
    is_active: config.is_active,
    is_deleted: config.is_deleted,

    created_by: userResponse(config.created_by),
    updated_by: userResponse(config.updated_by),
    deleted_by: userResponse(config.deleted_by),

    created_at: config.createdAt,
    updated_at: config.updatedAt,
    deleted_at: config.deleted_at,
  };
};

export const serviceCountryConfigListResponse = (data: any): any =>
  data?.map((config: any) => serviceCountryConfigResponse(config)) ?? [];
