import IRole from "@/database/roles/roles-db-interface";
import { Strict } from "@/utils/helpers/query-filter";

export interface IInputRolesPayload extends Partial<IRole> { }

export interface IInputIRolesPayloadStrict extends Strict<
  Partial<IRole> &
  Required<
    Pick<
      IRole,
      | "title"
      | "label"
      | "color"
    >
  >
> { }
