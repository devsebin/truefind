import { CommonServiceFieldsInterface } from "@/utils/definitions/constants/db-constants";

export interface IKeys {
    original: string;
    thumbnails?: string[];
    webpThumbnails?: string[];
}

export interface IUrls {
    original: string;
    thumbnails?: string[];
    webpThumbnails?: string[];
}
interface IDocument extends CommonServiceFieldsInterface {
    name: string;
    document_type: string;
    content_type: string;
    keys: IKeys;
    unsigned_urls?: IUrls;
    created_at?: Date;
    updated_at?: Date;
}

export default IDocument;
