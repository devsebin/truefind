import { ApiResponse } from "@/utils/responses/api.response";
import { CustomError } from "@/utils/responses/error.response";
import { walletErrorMessages, walletSuccessMessages } from "./user-wallets.messages";
import { successResponse } from "@/utils/responses/success.response";
import { DbTransaction } from "@/utils/interfaces/activity-log.interface";

export function walletPayload(
  type: keyof typeof walletSuccessMessages,
  data: any = [],
  DbTransaction: DbTransaction[] = []
) {
  const { message, status } = walletSuccessMessages[type];
  return {
    result: successResponse(message, status, data),
    DbTransaction: DbTransaction,
  };
}

export function throwError<T = any>(
  message: keyof typeof walletErrorMessages,
  data: ApiResponse<T>
): never {
  const error = new Error() as CustomError;
  error.message = message;
  error.name = "ValidationError";
  error.data = data;
  throw error;
}
