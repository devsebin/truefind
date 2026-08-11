import { Request } from "express";
import { datatypes } from "../definitions/constants/data-types";
import { searchTypes } from "../definitions/constants/search-types";
import { AccessType } from "../interfaces/api.interface";
import { convertParamsToId } from "@/middlewares/authorization-api.middleware";
import { api } from "@/database/apis/apis-db-model";

const ROLE_ACCESS_MAP = {
  admin: "admin_access",
  user: "user_access",
  employee: "employee_access",
} as const;

export async function buildWhereClause(request: Request) {
  const where: any = { is_deleted: false, is_active: true };
  const conditions = request.query;

  const apiData = await api.findOne({
    url: convertParamsToId(request.originalUrl.split("?")[0]),
    activity_method: request.method.toLowerCase(),
    status: true,
  });

  if (!apiData) return where;

  const role = request.user.role as keyof typeof ROLE_ACCESS_MAP;
  const roleKey = ROLE_ACCESS_MAP[role];

  /**
   * STEP 1: FILTER SEARCH PARAMS SAFELY
   */
  const allowedParams = (apiData.search_params || []).filter((param) => {
    return (
      param.is_active === true &&
      param[roleKey] === true &&
      conditions[param.title] !== undefined
    );
  });

  /**
   * STEP 2: BUILD QUERY
   */
  allowedParams.forEach((param) => {
    const value = conditions[param.title];

    if (param.search_type === searchTypes.Exact) {
      if (param.datatype === datatypes.Boolean) {
        where[param.value] = value === "true";
      } else {
        where[param.value] = value;
      }
    }

    if (param.search_type === searchTypes.Partial) {
      where[param.value] = {
        $regex: value,
        $options: "i",
      };
    }

    if (param.search_type === searchTypes.GreaterThan) {
      where[param.value] = { $gte: value };
    }

    if (param.search_type === searchTypes.LessThan) {
      where[param.value] = { $lte: value };
    }
  });

  /**
   * STEP 3: APPLY SCOPED ACCESS (IMPORTANT FIX)
   */
  const accessConfig = apiData.access_params?.[roleKey];

  if (accessConfig?.type === AccessType.SCOPED) {
    accessConfig.keys.forEach((key) => {
      where[key] = request.user.id;
    });
  }

  return where;
}
