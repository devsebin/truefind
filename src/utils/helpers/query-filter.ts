type FieldCondition<T> =
  | T
  | ({
      $in?: (NonNullable<T> | null)[];
      $nin?: (NonNullable<T> | null)[];
      $eq?: T | null;
      $ne?: T | null;
      $gt?: NonNullable<T>;
      $gte?: NonNullable<T>;
      $lt?: NonNullable<T>;
      $lte?: NonNullable<T>;
      $exists?: boolean;
    } & (NonNullable<T> extends string ? { $regex?: string | RegExp; $options?: string } : {}));

type StrictFilterQuery<T> = {
  [K in keyof T]?: FieldCondition<T[K]>;
} & {
  $or?: StrictFilterQuery<T>[];
  $and?: StrictFilterQuery<T>[];
  $in?: unknown[];
};

export type Strict<T> = {
  [K in keyof T]: T[K];
};
export default StrictFilterQuery;
