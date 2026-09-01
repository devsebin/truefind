import { DbTransaction } from "@/utils/interfaces/activity-log.interface";
import { generateToken } from "../helpers/otp-helper";

export interface result {
  success: boolean;
  message: string;
  code: number;
  data: any[];
}

export interface listResponse {
  result: result;
  DbTransaction: DbTransaction[];
}

export interface successData {
  success: boolean;
  message: string;
  code: number;
  data?: any;
}

export interface SingleResponse {
  result: successData;
  DbTransaction: DbTransaction[];
}

export type SuccessResponse = SingleResponse;

export const successResponse = (
  message: string,
  statusCode: number,
  data: any[] = [],
) => ({
  success: true,
  message,
  code: statusCode,
  data: [
    {
      result: data,
      meta: {
        requestId: generateToken(10),
        timestamp: new Date().toISOString(),
      },
    },
  ],
});
