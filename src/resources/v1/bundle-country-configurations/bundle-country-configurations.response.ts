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

const bundleResponse = (bundle: any) =>
  bundle
    ? {
        id: bundle._id,
        name: bundle.name,
        code: bundle.code,
        description: bundle.description,
        is_active: bundle.is_active,
        estimated_time: bundle.estimated_time,
        estimated_time_unit: bundle.estimated_time_unit,
      }
    : null;

const countryResponse = (country: any) =>
  country
    ? {
        id: country._id,
        name: country.name,
        iso_code: country.iso_code,
        iso_code_3: country.iso_code_3,
        providers:
          country.providers?.map((provider: any) =>
            providerResponse(provider.provider_id),
          ) || [],
      }
    : null;

const currencyResponse = (currency: any) =>
  currency
    ? {
        id: currency._id,
        title: currency.title,
        label: currency.label,
        code: currency.code,
      }
    : null;

const unitResponse = (unit: any) =>
  unit
    ? {
        id: unit._id,
        title: unit.title,
        label: unit.label,
        dimension: unit.dimension,
        color: unit.color,
      }
    : null;

const providerResponse = (provider: any) =>
  provider
    ? {
        id: provider._id,
        name: provider.name,
        is_active: provider.is_active,
        is_deleted: provider.is_deleted,
        is_default: provider.is_default,
      }
    : null;

const statusResponse = (status: any) =>
  status
    ? {
        id: status._id,
        title: status.title,
        label: status.label,
        color: status.color,
        is_default: status.is_default,
      }
    : null;

export const bundleCountryConfigResponse = (config: any): any => {
  if (!config) return null;

  return {
    id: config._id,
    bundle: bundleResponse(config.bundle_id),
    country: countryResponse(config.country_id),
    currency: currencyResponse(config.currency_id),
    unit: unitResponse(config.unit_id),
    status: statusResponse(config.status_id),
    is_callout_bundle: config.is_callout_bundle,
    is_fixed_price: config.is_fixed_price,
    price: config.price,
    minimum_price: config.minimum_price,
    maximum_price: config.maximum_price,
    call_out_fee: config.call_out_fee,
    estimated_time: config.estimated_time,
    estimated_time_unit: config.estimated_time_unit,
    individual_services_total: config.individual_services_total,
    bundle_discount_type: config.bundle_discount_type,
    bundle_discount_value: config.bundle_discount_value,
    metadata: config.metadata,
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

export const bundleCountryConfigListResponse = (data: any): any =>
  data?.map((config: any) => bundleCountryConfigResponse(config)) ?? [];
