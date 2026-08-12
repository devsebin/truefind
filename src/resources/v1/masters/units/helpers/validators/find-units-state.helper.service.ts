import IUnits from "@/database/units/units-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../units.helper";
import { unitsErrorResponse } from "../../units.response";

class findUnitsStateHelperService {
  async isAlreadyActive(
    unit: HydratedDocument<IUnits>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (unit.is_active) {
        const data = unitsErrorResponse(unit);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "unit is already active with title: {0} and id: {1}",
            data: { data },
            filler: { 0: unit.title, 1: unit._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking active unit", errorMap);
    }
  }

  async isAlreadyInactive(
    unit: HydratedDocument<IUnits>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!unit.is_active) {
        const data = unitsErrorResponse(unit);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "unit is already inactive with title: {0} and id: {1}",
            data: { data },
            filler: { 0: unit.title, 1: unit._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking inactive unit", errorMap);
    }
  }

  async isAlreadyDeleted(
    unit: HydratedDocument<IUnits>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (unit.is_deleted) {
        const data = unitsErrorResponse(unit);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "unit is already deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: unit.title, 1: unit._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted unit", errorMap);
    }
  }

  async isNotDeleted(
    unit: HydratedDocument<IUnits>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!unit.is_deleted) {
        const data = unitsErrorResponse(unit);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "unit is not deleted with title: {0} and id: {1}",
            data: { data },
            filler: { 0: unit.title, 1: unit._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted unit", errorMap);
    }
  }
}

export default new findUnitsStateHelperService();
