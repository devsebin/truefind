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

export const serviceInformationResponse = (info: any): any => {
  if (!info) return null;

  return {
    id: info._id || info.id,
    service:
      info.service_id && typeof info.service_id === "object"
        ? serviceResponse(info.service_id)
        : info.service_id,
    how_it_works: (info.how_it_works || []).map((item: any) => ({
      id: item._id || item.id,
      step: item.step,
      title: item.title,
      description: item.description,
      sort_order: item.sort_order,
    })),
    included_items: (info.included_items || []).map((item: any) => ({
      id: item._id || item.id,
      title: item.title,
      description: item.description,
      sort_order: item.sort_order,
    })),
    insurance_coverage: info.insurance_coverage
      ? {
          enabled: info.insurance_coverage.enabled,
          title: info.insurance_coverage.title,
          description: info.insurance_coverage.description,
          coverage_items: info.insurance_coverage.coverage_items || [],
          disclaimer: info.insurance_coverage.disclaimer,
          sort_order: info.insurance_coverage.sort_order,
        }
      : null,
    faqs: (info.faqs || []).map((item: any) => ({
      id: item._id || item.id,
      question: item.question,
      answer: item.answer,
      sort_order: item.sort_order,
    })),
    disclaimers: (info.disclaimers || []).map((item: any) => ({
      id: item._id || item.id,
      title: item.title,
      content: item.content,
      sort_order: item.sort_order,
    })),
    status: statusResponse(info.status_id),
    is_active: info.is_active,
    is_deleted: info.is_deleted,

    created_by: userResponse(info.created_by),
    updated_by: userResponse(info.updated_by),
    deleted_by: userResponse(info.deleted_by),

    created_at: info.createdAt,
    updated_at: info.updatedAt,
    deleted_at: info.deleted_at,
  };
};

export const serviceInformationListResponse = (data: any[]): any[] =>
  data?.map((info: any) => serviceInformationResponse(info)) ?? [];
