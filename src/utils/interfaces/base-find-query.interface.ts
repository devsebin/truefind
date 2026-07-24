import { ClientSession, PopulateOptions } from "mongoose";

export interface IBaseFindOptions {
  throwIfExists?: boolean;
  throwIfNotFound?: boolean;

  returnDocument?: boolean;

  lean?: boolean;

  select?: string | Record<string, number>;

  populate?: string[] | PopulateOptions[];

  sort?: Record<string, 1 | -1>;

  session?: ClientSession;

  includeDeleted?: boolean;
}
