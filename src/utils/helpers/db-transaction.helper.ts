import mongoose from "mongoose";
import { DbTransaction } from "../interfaces/activity-log.interface";

export async function createDbTransaction(
  table: string,
  method: string,
  operation: string,
  data: any,
  field_changes: any[] = [],
): Promise<DbTransaction> {
  return {
    transaction_id: crypto.randomUUID(),
    method: method,
    operation: operation,
    table: table,
    details: {
      conditions: [],
      query: "string",
      data: data,
    },
    field_changes: field_changes,
  };
}

export const abortTransaction = async (session: mongoose.ClientSession) => {
  await session.abortTransaction();
  session.endSession();
};

export const commitTransaction = async (session: mongoose.ClientSession) => {
  await session.commitTransaction();
  session.endSession();
};
