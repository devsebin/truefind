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
      id: service._id,
      name: service.name,
      type: service.type,
      description: service.description,
      icon: service.icon,
      estimated_time: service.estimated_time,
      estimated_time_unit: service.estimated_time_unit,
    }
    : null;

export const serviceUserConfigResponse = (config: any): any => ({
  id: config._id,
  user: userResponse(config.user_id),
  user_id: config.user_id?._id || config.user_id,
  service: serviceResponse(config.task_id),
  service_id: config.task_id?._id || config.task_id,
  eligibility_status: config.eligibility_status,
  is_active: config.is_active,
  is_deleted: config.is_deleted,

  created_by: userResponse(config.created_by),
  updated_by: userResponse(config.updated_by),
  deleted_by: userResponse(config.deleted_by),

  created_at: config.createdAt,
  updated_at: config.updatedAt,
  deleted_at: config.deleted_at,
});

export const serviceUserConfigListResponse = (data: any[]): any[] =>
  data?.map((config) => serviceUserConfigResponse(config)) ?? [];

export const serviceUserConfigErrorResponse = (config: any): any => ({
  id: config._id,
  user_id: config.user_id?._id || config.user_id,
  task_id: config.task_id?._id || config.task_id,
  eligibility_status: config.eligibility_status,
  is_active: config.is_active,
  is_deleted: config.is_deleted,
});
