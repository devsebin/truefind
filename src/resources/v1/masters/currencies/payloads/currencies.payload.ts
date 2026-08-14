export interface IInputICurrencyPayload {
  title: string;
  label: string;
  code: string;
  symbol: string;
  is_active?: boolean;
}

export interface IInputICurrencyPayloadStrict extends IInputICurrencyPayload {}
