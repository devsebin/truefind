import IRole from "@/database/roles/roles-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../roles.helper";
import { rolesErrorResponse } from "../../roles.response";

class findRolesStateHelperService {
  async isAlreadyActive(
    role: HydratedDocument<IRole>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (role.is_active) {
        const data = rolesErrorResponse(role);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "role is already active with title: {0} and id: {1}",
            data: { data },
            filler: { 0: role.title, 1: role._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking active role", errorMap);
    }
  }

  async isAlreadyInactive(
    role: HydratedDocument<IRole>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!role.is_active) {
        const data = rolesErrorResponse(role);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "role is already inactive with title: {0} and id: {1}",
            data: { data },
            filler: { 0: role.title, 1: role._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking inactive role", errorMap);
    }
  }

  async isAlreadyDeleted(
    role: HydratedDocument<IRole>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (role.is_deleted) {
        const data = rolesErrorResponse(role);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "role is already deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: role.title, 1: role._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted role", errorMap);
    }
  }

  async isNotDeleted(
    role: HydratedDocument<IRole>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!role.is_deleted) {
        const data = rolesErrorResponse(role);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "role is not deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: role.title, 1: role._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted role", errorMap);
    }
  }
}

export default new findRolesStateHelperService();
