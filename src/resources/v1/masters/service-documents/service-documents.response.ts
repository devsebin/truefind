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

const statusResponse = (status: any) =>
    status
        ? {
            id: status._id,
            title: status.title,
        }
        : null;

const documentTypeResponse = (docType: any) =>
    docType
        ? {
            id: docType._id,
            name: docType.name,
            item_code: docType.item_code,
        }
        : null;

const sampleResponse = (sample: any) =>
    sample
        ? {
            id: sample._id,
            name: sample.name,
            document_type: sample.document_type,
            content_type: sample.content_type,
            keys: sample.keys,
            unsigned_urls: sample.unsigned_urls,
        }
        : null;

export const serviceDocumentResponse = (doc: any): any => ({
    id: doc._id,
    name: doc.name,
    display_name: doc.display_name,
    item_code: doc.item_code,
    document_type_id: doc.document_type_id?._id ? documentTypeResponse(doc.document_type_id) : doc.document_type_id,
    description: doc.description,
    max_file_size: doc.max_file_size,
    accepted_mimeTypes: doc.accepted_mimeTypes,
    samples: doc.samples?.map((sample: any) => (sample?._id ? sampleResponse(sample) : sample)) ?? [],
    data_requirements: doc.data_requirements ?? [],

    is_active: doc.is_active,
    is_deleted: doc.is_deleted,

    status: statusResponse(doc.status_id),
    created_by: userResponse(doc.created_by),
    updated_by: userResponse(doc.updated_by),
    deleted_by: userResponse(doc.deleted_by),

    created_at: doc.createdAt,
    updated_at: doc.updatedAt,
    deleted_at: doc.deleted_at,
});

export const serviceDocumentListResponse = (data: any): any =>
    data?.map((doc: any) => {
        return serviceDocumentResponse(doc);
    }) ?? [];

export const serviceDocumentErrorResponse = (doc: any): any => ({
    id: doc._id,
    name: doc.name,
    display_name: doc.display_name,
    item_code: doc.item_code,
    is_active: doc.is_active,
    is_deleted: doc.is_deleted,
});
