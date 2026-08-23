import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";

interface Target {
    type: "everyone" | "userIds" | "userType" | "country" | "newUser"
    | "allVerifiedUser" | "vipUser" | "newFreeUser" | "newVipUser";
    value?: unknown;
}

export interface IButton {
    text?: string;
    action?: string;
    url?: string;
}

export interface IColorPattern {
    primary?: string;
    secondary?: string;
}

export interface ICarousel extends CommonServiceFieldsInterface {
    slideType: "promotion" | "coupon" | "info" | "announcement" | "banner"
    | "news";
    title?: string;
    description?: string;
    image?: string;
    target?: Target;
    button?: IButton;
    colorPattern?: IColorPattern;
    redeemCode?: string;
}