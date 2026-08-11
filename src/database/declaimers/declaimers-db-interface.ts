import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";
import mongoose from "mongoose";

export interface IDeclaimer extends CommonServiceFieldsInterface {
    key: string; // stable identifier (e.g. "terms_and_conditions")
    title: string;
    content: string;

    version: number; // version number (1,2,3...)
    language: string; // e.g. "en", "fr"
    country: mongoose.Types.ObjectId;
    is_latest: boolean;

    published_at: Date;

    metadata?: Record<string, any>;
}
