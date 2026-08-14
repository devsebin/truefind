import mongoose from "mongoose";
import { IInputICurrencyPayloadStrict } from "../payloads/currencies.payload";

export interface ICurrencyDTO {
  title: string;
  label: string;
  code: string;
  symbol: mongoose.Types.ObjectId;
}

export function toCurrencyDTO(body: IInputICurrencyPayloadStrict): ICurrencyDTO {
  return {
    title: body.title?.trim().toUpperCase(),
    label: body.label?.trim()?.toLowerCase(),
    code: body.code?.trim()?.toUpperCase(),
    symbol: new mongoose.Types.ObjectId(body.symbol),
  };
}
