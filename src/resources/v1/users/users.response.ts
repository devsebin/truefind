export const userResponse = (user: any): any => {
  if (!user) return null;
  return {
    id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    country_id: user.country_id,
    region_id: user.region_id,
    district_id: user.district_id,
    suburb_id: user.suburb_id,
    is_active: user.is_active,
    is_deleted: user.is_deleted,
    declaimer: user.declaimer || [],
    user_basic: user.user_basic || null,
    status_id: user.status_id,
    priority_id: user.priority_id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

export const userListResponse = (data: any[]): any[] => {
  return data?.map((user) => userResponse(user)) ?? [];
};
