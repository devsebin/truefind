import mongoose from "mongoose";
import { throwError } from "../statuses.helper";
import { ErrorTypes, ResponseBuilder } from "@/utils/helpers/response-builder";
import { rethrowIfKnown } from "@/utils/responses/error.response";

interface ICheckAlreadyExistsParams {
  currentId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  errorMap: Record<string, { message: string; status: number }>;

  entity?: string;
  state?: string;
}

export function checkIfAlreadyInState({
  currentId,
  targetId,
  errorMap,
  entity = "Status",
  state = "active",
}: ICheckAlreadyExistsParams): void {
  try {
    if (currentId.toString() === targetId.toString()) {
      const response = ResponseBuilder.error(ErrorTypes.VALIDATION_ERROR, {
        message: `${entity} is already ${state}`,
        data: { _id: currentId },
        filler: { 0: currentId },
      });

      throwError("already_activated", response);
    }
  } catch (error) {
    rethrowIfKnown(error, `Error while checking ${entity} state`, errorMap);
  }
}
