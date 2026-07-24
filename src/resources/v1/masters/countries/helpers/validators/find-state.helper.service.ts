import ICountry from "@/database/countries/countries-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../countries.helper";
import { countryErrorResponse } from "../../countries.response";

class findCountryStateHelperService {
  async isAlreadyActive(
    country: HydratedDocument<ICountry>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (country.is_active) {
        const data = countryErrorResponse(country);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "country is already active with name: {0} and id: {1}",
            data: { data },
            filler: { 0: country.name, 1: country._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking active country", errorMap);
    }
  }

  async isAlreadyInactive(
    country: HydratedDocument<ICountry>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!country.is_active) {
        const data = countryErrorResponse(country);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "country is already inactive with name: {0} and id: {1}",
            data: { data },
            filler: { 0: country.name, 1: country._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking inactive country", errorMap);
    }
  }

  async isAlreadyDeleted(
    country: HydratedDocument<ICountry>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (country.is_deleted) {
        const data = countryErrorResponse(country);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "country is already deleted with name: {0} and id: {1}",
            data: { data },
            filler: { 0: country.name, 1: country._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted country", errorMap);
    }
  }

  async isNotDeleted(
    country: HydratedDocument<ICountry>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!country.is_deleted) {
        const data = countryErrorResponse(country);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "country is not deleted with name: {0} and id: {1}",
            data: { data },
            filler: { 0: country.name, 1: country._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted country", errorMap);
    }
  }
}

export default new findCountryStateHelperService();
