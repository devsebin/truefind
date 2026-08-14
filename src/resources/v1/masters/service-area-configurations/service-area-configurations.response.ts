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

export const serviceAreaConfigResponse = (config: any): any => {
  if (!config) return null;

  return {
    id: config._id,
    service_id: config.service_id,
    suburb_id: config.suburb_id,
    required_licenses: config.required_licenses,
    is_callout_service: config.is_callout_service,
    is_fixed_price: config.is_fixed_price,
    price: config.price,
    unit_id: config.unit_id,
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

export const serviceAreaConfigListResponse = (data: any): any =>
  data?.map((config: any) => serviceAreaConfigResponse(config)) ?? [];
