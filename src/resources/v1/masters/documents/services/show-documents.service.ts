
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import {
    buildErrorResult,
    ErrorResponse,
    rethrowIfKnown,
} from "@/utils/responses/error.response";
import { SingleResponse } from "@/utils/responses/success.response";
import mongoose, { Document, Model } from "mongoose";
import { generateS3SignedUrl } from "@/services/aws/s3-helper";
import { createDbTransaction } from "@/utils/helpers/db-transaction.helper";
import { tableName } from "@/utils/definitions/constants/table-names";
import { apiMethods } from "@/utils/definitions/constants/api-methods";
import { operationTypes } from "@/utils/definitions/constants/operation-types";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import IDocument from "@/database/documents/documents-db-interface";
import DocumentModel from "@/database/documents/documents-db-model";
import { FilesSuccessPayload, populateFields, throwError } from "../documents.helper";
import { DocumentErrorMessages } from "../documents.messages";

/**
 * showDocumentService Class
 * ==================
 * Responsible for retrieving a single document from the database.
 *
 * Key Steps:
 * 1. **Validate ID**: Ensures provided ID is a valid MongoDB ObjectId.
 * 2. **Start Session & Transaction**: Initiates MongoDB session for transactional consistency.
 * 3. **Fetch Document**: Retrieves the document along with related references via `.populate`.
 * 4. **Log Transaction**: Logs the retrieval as a database transaction.
 * 5. **Return Data or Error**: Returns the document on success or proper error message on failure.
 *
 * Models Involved:
 * - `DocumentModel`: Main model used to query document records.
 *
 * Returns:
 * - `SingleResponse` on success
 * - `ErrorResponse` on failure
 */
class showDocumentService {
    private readonly documentModel: Model<IDocument>;

    constructor() {
        this.documentModel = DocumentModel;
    }

    async execute(
        documentId: mongoose.Types.ObjectId,
    ): Promise<SingleResponse | ErrorResponse> {
        const dbTransactions: DbTransaction[] = [];
        const session = await mongoose.startSession();

        try {
            // Step 1: Validate ID
            if (!mongoose.Types.ObjectId.isValid(documentId)) {
                const response = ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
                    message: "Provided document ID is not valid",
                    data: { documentId },
                    filler: { documentId },
                });
                return throwError("invalid_id", response);
            }

            // Step 2: Start transaction
            session.startTransaction();

            // Step 3: Fetch document with populated fields
            const document = await this.findDocumentById(
                documentId,
                session,
                dbTransactions,
            );

            // Step 5: Commit transaction
            await session.commitTransaction();

            // Step 6: Return success response
            return FilesSuccessPayload("file_fetched", document, dbTransactions);
        } catch (error) {
            // If error occurs, abort transaction and handle it
            await session.abortTransaction();
            const err = error as Error & { data?: any };

            return buildErrorResult(err.message, DocumentErrorMessages, err.data);
        } finally {
            session.endSession();
        }
    }

    /**
     * Finds a document by ID, with references populated.
     */
    private async findDocumentById(
        documentId: mongoose.Types.ObjectId,
        session: mongoose.ClientSession,
        dbTransactions: DbTransaction[],
    ): Promise<(IDocument & Document) | null> {
        try {
            const document = await this.documentModel
                .findOne({
                    _id: documentId,
                    is_deleted: false,
                    is_active: true,
                })
                .populate(populateFields)
                .session(session);

            if (!document) {
                const response = ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
                    message: "Document not found",
                    data: { documentId },
                    filler: { documentId },
                });
                throwError("file_not_found", response);
            }

            if (document.keys && document.keys.original) {
                document.keys.original = await generateS3SignedUrl(
                    document.keys.original,
                    3600,
                );
            }

            if (document.keys && document.keys.thumbnails) {
                document.keys.thumbnails = await Promise.all(
                    document.keys.thumbnails.map(async (thumbnail: string) => {
                        return await generateS3SignedUrl(thumbnail, 3600);
                    }),
                );
            }

            // Step 4: Log DB transaction
            dbTransactions.push(
                await createDbTransaction(
                    tableName.Documents,
                    apiMethods.GET,
                    operationTypes.Read,
                    document,
                ),
            );

            return document;
        } catch (error) {
            rethrowIfKnown(
                error,
                "Error while fetching document by ID",
                DocumentErrorMessages,
            );
        }
    }
}

export default new showDocumentService();
