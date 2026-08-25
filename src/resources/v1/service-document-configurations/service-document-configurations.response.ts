const userResponse = (user: any) =>
  user
    ? {
        id: user._id || user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      }
    : null;

const statusResponse = (status: any) =>
  status
    ? {
        id: status._id || status.id,
        title: status.title,
        label: status.label,
        color: status.color,
      }
    : null;

const serviceResponse = (service: any) =>
  service
    ? {
        id: service._id || service.id,
        name: service.name,
        code: service.code,
        description: service.description,
        type: service.type,
        is_active: service.is_active,
      }
    : null;

const documentResponse = (doc: any) =>
  doc
    ? {
        id: doc._id || doc.id,
        name: doc.name,
        display_name: doc.display_name,
        item_code: doc.item_code,
        max_file_size: doc.max_file_size,
        accepted_mimeTypes: doc.accepted_mimeTypes,
        description: doc.description,
        samples: doc.samples,
        data_requirements: doc.data_requirements,
      }
    : null;

const requiredDocumentResponse = (reqDoc: any) => ({
  id: reqDoc._id || reqDoc.id,
  document: reqDoc.document_id && typeof reqDoc.document_id === "object"
    ? documentResponse(reqDoc.document_id)
    : reqDoc.document_id,
  is_mandatory: reqDoc.is_mandatory ?? true,
  exemption_documents: reqDoc.exemption_documents?.map((ex: any) => ({
    id: ex._id || ex.id,
    document: ex.document_id && typeof ex.document_id === "object"
      ? documentResponse(ex.document_id)
      : ex.document_id,
    condition: ex.condition || "valid",
  })) ?? [],
  status: statusResponse(reqDoc.status_id),
  is_active: reqDoc.is_active,
  is_deleted: reqDoc.is_deleted,
  created_by: userResponse(reqDoc.created_by),
  updated_by: userResponse(reqDoc.updated_by),
  deleted_by: userResponse(reqDoc.deleted_by),
  created_at: reqDoc.createdAt,
  updated_at: reqDoc.updatedAt,
  deleted_at: reqDoc.deleted_at,
});

export const serviceDocumentConfigResponse = (config: any): any => {
  if (!config) return null;

  return {
    id: config._id || config.id,
    service: config.service_id && typeof config.service_id === "object"
      ? serviceResponse(config.service_id)
      : config.service_id,
    required_documents: config.required_documents?.map((reqDoc: any) =>
      requiredDocumentResponse(reqDoc)
    ) ?? [],
    status: statusResponse(config.status_id),
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

export const serviceDocumentConfigListResponse = (data: any[]): any[] =>
  data?.map((config: any) => serviceDocumentConfigResponse(config)) ?? [];
