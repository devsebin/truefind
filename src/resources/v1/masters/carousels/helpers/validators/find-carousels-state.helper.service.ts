import { ICarousel } from "@/database/carousels/carousels-db-interface";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import { HydratedDocument } from "mongoose";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { throwError } from "../../carousels.helper";
import { carouselErrorResponse } from "../../carousels.response";

class findCarouselsStateHelperService {
  async isAlreadyActive(
    carousel: HydratedDocument<ICarousel>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (carousel.is_active) {
        const data = carouselErrorResponse(carousel);
        throwError(
          "already_activated",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "carousel is already active with id: {0}",
            data: { data },
            filler: { 0: carousel._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking active carousel", errorMap);
    }
  }

  async isAlreadyInactive(
    carousel: HydratedDocument<ICarousel>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!carousel.is_active) {
        const data = carouselErrorResponse(carousel);

        throwError(
          "already_inactive",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "carousel is already inactive with id: {0}",
            data: { data },
            filler: { 0: carousel._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking inactive carousel", errorMap);
    }
  }

  async isAlreadyDeleted(
    carousel: HydratedDocument<ICarousel>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (carousel.is_deleted) {
        const data = carouselErrorResponse(carousel);

        throwError(
          "already_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "carousel is already deleted with id: {0}",
            data: { data },
            filler: { 0: carousel._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted carousel", errorMap);
    }
  }

  async isNotDeleted(
    carousel: HydratedDocument<ICarousel>,
    errorMap: Record<string, { message: string; status: number }>,
  ): Promise<void> {
    try {
      if (!carousel.is_deleted) {
        const data = carouselErrorResponse(carousel);

        throwError(
          "not_deleted",
          ResponseBuilder.error(ErrorTypes.CONFLICT, {
            message: "carousel is not deleted with id: {0}",
            data: { data },
            filler: { 0: carousel._id },
          }),
        );
      }
    } catch (error) {
      rethrowIfKnown(error, "Error while checking deleted carousel", errorMap);
    }
  }
}

export default new findCarouselsStateHelperService();
