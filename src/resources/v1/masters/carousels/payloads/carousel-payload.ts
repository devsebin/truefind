import { ICarousel } from "@/database/carousels/carousels-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

/**
 * Base payload (all fields optional, strictly from ICarousel)
 */
export interface IInputCarouselPayload extends Partial<ICarousel> {}

/**
 * Strict payload
 * - only ICarousel keys allowed
 * - required business fields enforced
 */
export interface IInputICarouselPayloadStrict
  extends Strict<
    Partial<ICarousel> &
      Required<
        Pick<
          ICarousel,
          "slideType"
        >
      >
  > {}
