export const userResponse = (user: any): any => {
  if (!user) return null;
  return {
    id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    user_location: user.user_location,
    user_country: user.user_country,
    user_region: user.user_region,
    user_city: user.user_city,
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
