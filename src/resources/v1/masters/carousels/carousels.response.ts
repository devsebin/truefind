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

export const carouselResponse = (carousel: any): any => ({
  id: carousel._id,
  slideType: carousel.slideType,
  title: carousel.title,
  description: carousel.description,
  image: carousel.image,
  target: carousel.target,
  button: carousel.button,
  colorPattern: carousel.colorPattern,
  redeemCode: carousel.redeemCode,
  is_active: carousel.is_active,
  is_deleted: carousel.is_deleted,

  created_by: userResponse(carousel.created_by),
  updated_by: userResponse(carousel.updated_by),
  deleted_by: userResponse(carousel.deleted_by),

  created_at: carousel.createdAt,
  updated_at: carousel.updatedAt,
  deleted_at: carousel.deleted_at,
});

export const carouselListResponse = (data: any): any =>
  data?.map((carousel: any) => carouselResponse(carousel)) ?? [];

export const carouselErrorResponse = (carousel: any): any => ({
  id: carousel._id,
  slideType: carousel.slideType,
  title: carousel.title,
  is_active: carousel.is_active,
  is_deleted: carousel.is_deleted,
});
