const userResponse = (user: any) =>
  user && typeof user === "object" && (user._id || user.id || user.first_name)
    ? {
        id: user._id || user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      }
    : null;

const serviceResponse = (service: any) =>
  service && typeof service === "object" && (service._id || service.id || service.name)
    ? {
        id: service._id || service.id,
        name: service.name,
        type: service.type,
        description: service.description,
        icon: service.icon,
        estimated_time: service.estimated_time,
        estimated_time_unit: service.estimated_time_unit,
      }
    : null;

const sampleResponse = (sample: any) => {
  if (!sample) return null;
  if (typeof sample === "object") {
    return {
      id: sample._id || sample.id,
      name: sample.name,
      document_type: sample.document_type,
      content_type: sample.content_type,
      keys: sample.keys,
      unsigned_urls: sample.unsigned_urls,
    };
  }
  return { id: sample };
};

const documentTypeResponse = (docType: any) => {
  if (!docType) return null;
  if (typeof docType === "object") {
    return {
      id: docType._id || docType.id,
      name: docType.name,
      item_code: docType.item_code,
    };
  }
  return { id: docType };
};

const documentRequirementResponse = (doc: any) => {
  if (!doc) return null;
  if (typeof doc === "object" && (doc._id || doc.name)) {
    return {
      id: doc._id || doc.id,
      name: doc.name,
      display_name: doc.display_name,
      item_code: doc.item_code,
      document_type: doc.document_type_id
        ? documentTypeResponse(doc.document_type_id)
        : null,
      description: doc.description,
      max_file_size: doc.max_file_size,
      accepted_mimeTypes: doc.accepted_mimeTypes,
      samples: Array.isArray(doc.samples)
        ? doc.samples.map((s: any) => sampleResponse(s)).filter(Boolean)
        : [],
      data_requirements: doc.data_requirements ?? [],
    };
  }
  return { id: doc };
};

export const serviceUserDocConfigResponse = (config: any): any => ({
  id: config._id,
  user: userResponse(config.user_id),
  user_id: config.user_id?._id || config.user_id,
  service: serviceResponse(config.task_id),
  task_id: config.task_id?._id || config.task_id,
  document_requirement: documentRequirementResponse(config.document_requirement_id),
  document_requirement_id: config.document_requirement_id?._id || config.document_requirement_id,
  is_mandatory: config.is_mandatory,
  uploads: config.uploads || [],
  current_status: config.current_status,
  verified_by: userResponse(config.verified_by),
  verified_at: config.verified_at,
  is_active: config.is_active,
  is_deleted: config.is_deleted,

  created_by: userResponse(config.created_by),
  updated_by: userResponse(config.updated_by),
  deleted_by: userResponse(config.deleted_by),

  created_at: config.createdAt,
  updated_at: config.updatedAt,
  deleted_at: config.deleted_at,
});

export const serviceUserDocConfigListResponse = (data: any[]): any[] =>
  data?.map((config) => serviceUserDocConfigResponse(config)) ?? [];

export const serviceUserDocConfigErrorResponse = (config: any): any => ({
  id: config._id,
  user_id: config.user_id?._id || config.user_id,
  task_id: config.task_id?._id || config.task_id,
  document_requirement_id: config.document_requirement_id?._id || config.document_requirement_id,
  is_mandatory: config.is_mandatory,
  current_status: config.current_status,
  is_active: config.is_active,
  is_deleted: config.is_deleted,
});
