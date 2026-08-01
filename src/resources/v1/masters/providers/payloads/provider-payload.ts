import { IProvider } from "@/database/providers/providers-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputProviderPayload extends Partial<IProvider> { }

export interface IInputProviderPayloadStrict extends Strict<
  Partial<IProvider> &
  Required<
    Pick<
      IProvider,
      | "name"
    >
  >
> { }

export interface IUpdateProviderPayloadStrict extends Strict<
  Partial<IProvider> &
  Required<
    Pick<
      IProvider,
      | "name"
    >
  >
> { }
