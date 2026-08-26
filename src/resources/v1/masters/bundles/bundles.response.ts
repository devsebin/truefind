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

const documentResponse = (doc: any) =>
  doc && typeof doc === "object" && "_id" in doc
    ? {
        id: doc._id,
        url: doc.url,
        document_type: doc.document_type,
        file_name: doc.file_name,
        content_type: doc.content_type,
      }
    : doc;

const statusResponse = (status: any) =>
  status && typeof status === "object" && "_id" in status
    ? {
        id: status._id,
        title: status.title,
        label: status.label,
        color: status.color,
      }
    : status;

export const bundleResponse = (bundle: any): any => ({
  id: bundle._id,
  name: bundle.name,
  display_name: bundle.display_name,
  code: bundle.code,
  description: bundle.description,
  icon: documentResponse(bundle.icon),
  status_id: statusResponse(bundle.status_id),
  sort_order: bundle.sort_order,
  tags: bundle.tags,
  metadata: bundle.metadata,
  is_active: bundle.is_active,
  is_deleted: bundle.is_deleted,

  created_by: userResponse(bundle.created_by),
  updated_by: userResponse(bundle.updated_by),
  deleted_by: userResponse(bundle.deleted_by),

  created_at: bundle.createdAt,
  updated_at: bundle.updatedAt,
  deleted_at: bundle.deleted_at,
});

export const bundleListResponse = (data: any): any =>
  data?.map((item: any) => bundleResponse(item)) ?? [];

export const bundleErrorResponse = (bundle: any): any => ({
  id: bundle._id,
  name: bundle.name,
  code: bundle.code,
  is_active: bundle.is_active,
  is_deleted: bundle.is_deleted,
});
