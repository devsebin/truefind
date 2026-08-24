import { Document, Types } from "mongoose";
import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";

export interface IServiceHowItWorks {
    step: number;
    title: string;
    description: string;
    sort_order: number;
}

export interface IServiceIncludedItem {
    title: string;
    description?: string;
    sort_order: number;
}

export interface IServiceInsuranceCoverage {
    enabled: boolean;
    title?: string;
    description?: string;
    coverage_items: string[];
    disclaimer?: string;
    sort_order: number;
}

export interface IServiceFAQ {
    question: string;
    answer: string;
    sort_order: number;
}


export interface IServiceDisclaimer {
    title?: string;
    content: string;
    sort_order: number;
}


export interface IServiceInformation
    extends CommonServiceFieldsInterface,
    Document {
    service_id: Types.ObjectId;
    how_it_works: IServiceHowItWorks[];
    included_items: IServiceIncludedItem[];
    insurance_coverage: IServiceInsuranceCoverage;
    faqs: IServiceFAQ[];
    disclaimers: IServiceDisclaimer[];
}


