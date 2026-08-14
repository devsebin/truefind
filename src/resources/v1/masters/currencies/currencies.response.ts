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

const symbolResponse = (symbolObj: any) =>
  symbolObj
    ? {
      id: symbolObj._id,
      symbol: symbolObj.symbol,
    }
    : null;

export const currencyResponse = (currency: any): any => {
  if (!currency) return null;

  return {
    id: currency._id,
    title: currency.title,
    label: currency.label,
    code: currency.code,
    symbol: currency.symbol,
    is_active: currency.is_active,
    is_deleted: currency.is_deleted,

    created_by: userResponse(currency.created_by),
    updated_by: userResponse(currency.updated_by),
    deleted_by: userResponse(currency.deleted_by),

    created_at: currency.createdAt,
    updated_at: currency.updatedAt,
    deleted_at: currency.deleted_at,
  };
};

export const currencyListResponse = (data: any): any =>
  data?.map((currency: any) => currencyResponse(currency)) ?? [];

export const currencyErrorResponse = (currency: any): any => ({
  id: currency._id,
  title: currency.title,
  label: currency.label,
  code: currency.code,
  is_active: currency.is_active,
  is_deleted: currency.is_deleted,
});
