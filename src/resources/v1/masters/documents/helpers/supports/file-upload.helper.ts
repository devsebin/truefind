import fs from "fs";
import path from "path";
import sharp from "sharp";

import {
    buildErrorResult,
    ErrorResponse,
} from "@/utils/responses/error.response";
import { deleteS3Objects, uploadBufferToS3 } from "@/services/aws/s3-helper";
import { buildCloudFrontUrl, safeFileName } from "@/services/aws/cloudfront";
import {
    SingleResponse,
} from "@/utils/responses/success.response";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { FilesSuccessPayload, throwError } from "../../documents.helper";
export async function uploadFileToS3(
    reqFile: Express.Multer.File,
): Promise<SingleResponse | ErrorResponse> {
    const uploadedKeys: string[] = [];

    try {
        if (!fs.existsSync(reqFile.path)) {
            const response = ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
                message: "Uploaded file not found on server",
                data: { document: document },
                filler: { document: document },
            });
            throwError("SomethingWentWrong", response);
        }

        const ext = path.extname(reqFile.originalname);
        const baseName = path.parse(reqFile.originalname).name;
        const safeBaseName = safeFileName(baseName);
        const contentType = reqFile.mimetype || "application/octet-stream";
        const fileType = contentType.split("/")[0];

        const originalBuffer = await fs.promises.readFile(reqFile.path);
        const originalKey = `${Date.now()}-${safeBaseName}${ext}`;

        // Upload original
        await uploadBufferToS3(originalBuffer, originalKey, contentType);
        uploadedKeys.push(originalKey);

        // Base response structure
        const response: any = {
            name: reqFile.originalname,
            document_type: fileType,
            content_type: contentType,
            keys: {
                original: originalKey,
                thumbnails: [] as string[],
                webpThumbnails: [] as string[],
            },
        };

        if (fileType === "image") {
            response.unsigned_urls = {
                original: "",
                thumbnails: [] as string[],
                webpThumbnails: [] as string[],
            };
            const sizes = [64, 128, 256, 512, 1024];

            for (const size of sizes) {
                // --- Normal format thumbnail
                const thumbBuffer = await sharp(reqFile.path)
                    .resize(size, size, { fit: "cover", position: "center" })
                    .toBuffer();

                const thumbKey = `${Date.now()}-${safeBaseName}-${size}x${size}${ext}`;
                await uploadBufferToS3(thumbBuffer, thumbKey, contentType);
                uploadedKeys.push(thumbKey);

                response.keys.thumbnails.push(thumbKey);
                response.unsigned_urls.thumbnails.push(
                    buildCloudFrontUrl(thumbKey), // unsigned for listing
                );

                // --- WebP version of the thumbnail
                const webpBuffer = await sharp(reqFile.path)
                    .resize(size, size, { fit: "cover", position: "center" })
                    .webp({ quality: 80 })
                    .toBuffer();

                const webpKey = `${Date.now()}-${safeBaseName}-${size}x${size}.webp`;
                await uploadBufferToS3(webpBuffer, webpKey, "image/webp");
                uploadedKeys.push(webpKey);

                response.keys.webpThumbnails.push(webpKey);
                response.unsigned_urls.webpThumbnails.push(buildCloudFrontUrl(webpKey));
            }
            // Unsigned CloudFront URL for original image (fast listing)
            response.unsigned_urls.original = buildCloudFrontUrl(originalKey);
        }

        return FilesSuccessPayload("FileUploadToS3", response);
    } catch (err: any) {
        await deleteS3Objects(uploadedKeys);
        return buildErrorResult(err.message);
    }
}
