import { ICurrency } from "../../../database/currencies/currencies-db-interface";
import User from "../../../database/users/users-db-model";
import { getRoleId } from "../seeder-cookie";

export async function generateCurrencyData(symbolMap: Record<string, any>): Promise<Partial<ICurrency>[]> {
  const user = await User.findOne({ role: getRoleId("super_admin") });
  const userId = user ? user._id : undefined;

  return [
    {
      title: "US Dollar",
      label: "usd",
      code: "USD",
      symbol: symbolMap["USD"],
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "New Zealand Dollar",
      label: "nzd",
      code: "NZD",
      symbol: symbolMap["NZD"],
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Australian Dollar",
      label: "aud",
      code: "AUD",
      symbol: symbolMap["AUD"],
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Euro",
      label: "eur",
      code: "EUR",
      symbol: symbolMap["EUR"],
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "British Pound",
      label: "gbp",
      code: "GBP",
      symbol: symbolMap["GBP"],
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Canadian Dollar",
      label: "cad",
      code: "CAD",
      symbol: symbolMap["CAD"],
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Japanese Yen",
      label: "jpy",
      code: "JPY",
      symbol: symbolMap["JPY"],
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Indian Rupee",
      label: "inr",
      code: "INR",
      symbol: symbolMap["INR"],
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "Singapore Dollar",
      label: "sgd",
      code: "SGD",
      symbol: symbolMap["SGD"],
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
    {
      title: "UAE Dirham",
      label: "aed",
      code: "AED",
      symbol: symbolMap["AED"],
      is_active: true,
      is_deleted: false,
      created_by: userId,
    },
  ];
}
