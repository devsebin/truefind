import DocumentModel from "@/database/documents/documents-db-model";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";
import mongoose from "mongoose";
import { throwError } from "../../services.helper";
import { servicesErrorsMessages } from "../../services.messages";

class validateIconHelperService {
  public async execute(
    iconId: mongoose.Types.ObjectId,
    session: mongoose.ClientSession,
  ): Promise<void> {
    try {
      const icon = await DocumentModel.findById(iconId).session(session).lean();

      if (!icon) {
        throwError(
          "icon_not_found",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message: "Icon not found",
            data: { icon: iconId },
            filler: { 0: iconId.toString() },
          }),
        );
      }

      if (icon.document_type !== "image" || icon.content_type !== "image/png") {
        throwError(
          "icon_must_be_an_image",
          ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
            message: "Icon must be a PNG image",
            data: { icon: iconId },
          }),
        );
      }
    } catch (err: any) {
      rethrowIfKnown(err, "error while validating icon", servicesErrorsMessages);
    }
  }
}

export default new validateIconHelperService();
