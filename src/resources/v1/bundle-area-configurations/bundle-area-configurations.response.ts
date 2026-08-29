import mongoose from "mongoose";

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

const suburbResponse = (suburb: any) =>
  suburb
    ? {
        id: suburb._id,
        name: suburb.name,
        code: suburb.code,
        post_code: suburb.post_code,
        country_id: suburb.country_id,
        region_id: suburb.region_id,
        district_id: suburb.district_id,
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

const statusResponse = (status: any) => {
  if (!status) return null;
  if (status instanceof mongoose.Types.ObjectId || typeof status === "string") {
    return {
      id: status.toString(),
    };
  }
  return {
    id: status._id || status.id,
    title: status.title,
    label: status.label,
    color: status.color,
    is_default: status.is_default,
  };
};


export const bundleAreaConfigResponse = (config: any): any => {
  if (!config) return null;

  return {
    id: config._id,
    bundle: bundleResponse(config.bundle_id),
    suburb: suburbResponse(config.suburb_id),
    country_configuration_id: config.country_configuration_id?._id || config.country_configuration_id,
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

export const bundleAreaConfigListResponse = (data: any): any =>
  data?.map((config: any) => bundleAreaConfigResponse(config)) ?? [];
