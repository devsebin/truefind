import { CommonServiceFieldsModel } from "@/utils/definitions/constants/db-constants";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";
import mongoose, { Schema } from "mongoose";
import { IButton, ICarousel, IColorPattern } from "./carousels-db-interface";
import { tableName } from "@/utils/definitions/constants/table-names";


const buttonSchema = new Schema<IButton>(
    {
        text: {
            type: String,
        },
        action: {
            type: String,
        },
        url: {
            type: String,
        },
    },
    { _id: false }
);

const colorPatternSchema = new Schema<IColorPattern>(
    {
        primary: {
            type: String,
        },
        secondary: {
            type: String,
        },
    },
    { _id: false }
);

const carouselSchema = new mongoose.Schema<ICarousel>({
    slideType: {
        type: String,
        enum: [
            "promotion",
            "coupon",
            "info",
            "announcement",
            "banner",
            "news"
        ],
        required: true
    },
    title: String,
    description: String,
    image: String,
    target: {
        type: {
            type: String,
            enum: [
                "everyone",
                "userIds",
                "userType",
                "country",
                "newUser",
                "allVerifiedUser",
                "vipUser",
                "newFreeUser",
                "newVipUser"
            ],
            default: "everyone"
        },

        value: mongoose.Schema.Types.Mixed
    },
    button: buttonSchema,
    colorPattern: colorPatternSchema,
    redeemCode: String,
    ...CommonServiceFieldsModel,
}, {
    timestamps: true
});

carouselSchema.pre(/^find/, function (this: mongoose.Query<any, any>) {
    // Only add condition if not already present
    if (!this.getFilter().hasOwnProperty("is_deleted")) {
        this.where({ is_deleted: false, is_active: true });
    }
});

carouselSchema.plugin(defaultStatusPlugin);
carouselSchema.plugin(auditPlugin);

carouselSchema.methods.toJSON = function () {
    const countryObject = this.toObject();
    delete countryObject.__v;
    return countryObject;
};

// Create and export the model
const CarouselModel = mongoose.model<ICarousel>(
    tableName.Carousel,
    carouselSchema,
);

export default CarouselModel;