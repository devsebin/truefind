const userResponse = (user: any) =>
  user
    ? {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      }
    : null;

export const declaimerResponse = (declaimer: any): any => ({
  id: declaimer._id,
  key: declaimer.key,
  title: declaimer.title,
  content: declaimer.content,
  version: declaimer.version,
  is_latest: declaimer.is_latest,
  language: declaimer.language,
  country: declaimer.country,
  metadata: declaimer.metadata || {},
  is_active: declaimer.is_active,
  is_deleted: declaimer.is_deleted,

  created_by: userResponse(declaimer.created_by),
  updated_by: userResponse(declaimer.updated_by),
  deleted_by: userResponse(declaimer.deleted_by),

  published_at: declaimer.published_at,
  created_at: declaimer.createdAt,
  updated_at: declaimer.updatedAt,
  deleted_at: declaimer.deleted_at,
});

export const declaimerListResponse = (data: any): any =>
  data?.map((declaimer: any) => declaimerResponse(declaimer)) ?? [];

export const declaimerErrorResponse = (declaimer: any): any => ({
  id: declaimer._id,
  key: declaimer.key,
  title: declaimer.title,
  version: declaimer.version,
  is_active: declaimer.is_active,
  is_deleted: declaimer.is_deleted,
});
