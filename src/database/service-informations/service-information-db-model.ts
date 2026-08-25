import mongoose, { Schema } from "mongoose";
import { tableName } from "@/utils/definitions/constants/table-names";
import {
    CommonServiceFieldsModel,
} from "@/utils/definitions/constants/db-constants";

import {
    IServiceInformation,
    IServiceHowItWorks,
    IServiceIncludedItem,
    IServiceInsuranceCoverage,
    IServiceFAQ,
    IServiceDisclaimer,
} from "./service-information-db-interface";
import { auditPlugin } from "@/utils/plugins/audit.plugin";
import { defaultStatusPlugin } from "@/utils/plugins/defaultStatus.plugin";



/* =========================================================
 * HOW IT WORKS
 * ========================================================= */

const ServiceHowItWorksSchema =
    new Schema<IServiceHowItWorks>(
        {
            step: {
                type: Number,
                required: true,
                min: 1,
            },
            title: {
                type: String,
                required: true,
                trim: true,
                maxlength: 255,
            },
            description: {
                type: String,
                required: true,
                trim: true,
            },
            sort_order: {
                type: Number,
                required: true,
            },
        },
        {
            _id: true,
        },
    );

const ServiceIncludedItemSchema =
    new Schema<IServiceIncludedItem>(
        {
            title: {
                type: String,
                required: true,
                trim: true,
                maxlength: 255,
            },
            description: {
                type: String,
                trim: true,
                default: "",
            },
            sort_order: {
                type: Number,
                required: true,
            },
        },
        {
            _id: true,
        },
    );


const ServiceInsuranceCoverageSchema =
    new Schema<IServiceInsuranceCoverage>(
        {
            enabled: {
                type: Boolean,
                default: false,
            },
            title: {
                type: String,
                trim: true,
                maxlength: 255,
            },
            description: {
                type: String,
                trim: true,
                default: "",
            },
            coverage_items: {
                type: [String],
                default: [],
            },
            disclaimer: {
                type: String,
                trim: true,
                default: "",
            },
            sort_order: {
                type: Number,
                required: true,
            },
        },
        {
            _id: false,
        },
    );

const ServiceFAQSchema =
    new Schema<IServiceFAQ>(
        {
            question: {
                type: String,
                required: true,
                trim: true,
                maxlength: 500,
            },
            answer: {
                type: String,
                required: true,
                trim: true,
            },
            sort_order: {
                type: Number,
                required: true,
            },
        },
        {
            _id: true,
        },
    );

const ServiceDisclaimerSchema =
    new Schema<IServiceDisclaimer>(
        {
            title: {
                type: String,
                trim: true,
                maxlength: 255,
            },
            content: {
                type: String,
                required: true,
                trim: true,
            },
            sort_order: {
                type: Number,
                required: true,
            },
        },
        {
            _id: true,
        },
    );

const ServiceInformationSchema =
    new Schema<IServiceInformation>(
        {
            service_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.Services,
                required: true,
                unique: true,
            },
            how_it_works: {
                type: [ServiceHowItWorksSchema],
                default: [],
            },

            included_items: {
                type: [ServiceIncludedItemSchema],
                default: [],
            },
            insurance_coverage: {
                type: ServiceInsuranceCoverageSchema,
                default: () => ({
                    enabled: false,
                    coverage_items: [],
                }),
            },
            faqs: {
                type: [ServiceFAQSchema],
                default: [],
            },
            disclaimers: {
                type: [ServiceDisclaimerSchema],
                default: [],
            },
            status_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: tableName.Status,
            },
            ...CommonServiceFieldsModel,
        },
        {
            timestamps: true,
        },
    );

ServiceInformationSchema.plugin(auditPlugin);
ServiceInformationSchema.plugin(defaultStatusPlugin);

export const ServiceInformationModel =
    mongoose.model<IServiceInformation>(
        tableName.ServiceInformation,
        ServiceInformationSchema,
    );

export default ServiceInformationModel;