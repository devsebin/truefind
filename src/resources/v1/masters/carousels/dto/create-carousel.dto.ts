import { IButton, ICarousel, IColorPattern } from "@/database/carousels/carousels-db-interface";
import { IInputICarouselPayloadStrict } from "../payloads/carousel-payload";

export interface ICarouselDTO {
  slideType: "promotion" | "coupon" | "info" | "announcement" | "banner" | "news";
  title?: string;
  description?: string;
  image?: string;
  target?: {
    type: "everyone" | "userIds" | "userType" | "country" | "newUser" | "allVerifiedUser" | "vipUser" | "newFreeUser" | "newVipUser";
    value?: unknown;
  };
  button?: IButton;
  colorPattern?: IColorPattern;
  redeemCode?: string;
}

export function toCarouselDTO(body: IInputICarouselPayloadStrict): ICarouselDTO {
  const dto: ICarouselDTO = {
    slideType: body.slideType,
  };

  if (body.title !== undefined) dto.title = body.title?.trim();
  if (body.description !== undefined) dto.description = body.description?.trim();
  if (body.image !== undefined) dto.image = body.image?.trim();
  if (body.target !== undefined) dto.target = body.target;
  if (body.button !== undefined) dto.button = body.button;
  if (body.colorPattern !== undefined) dto.colorPattern = body.colorPattern;
  if (body.redeemCode !== undefined) dto.redeemCode = body.redeemCode?.trim();

  return dto;
}
