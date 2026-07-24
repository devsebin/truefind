type Primitive =
  | string
  | number
  | boolean
  | bigint
  | symbol
  | null
  | undefined
  | Date;

type NestedKeys<T> = {
  [K in keyof T & string]: T[K] extends Primitive | Array<any>
    ? K
    : K | `${K}.${NestedKeys<T[K]>}`;
}[keyof T & string];

export type NestedKey<T> = NestedKeys<T>;
