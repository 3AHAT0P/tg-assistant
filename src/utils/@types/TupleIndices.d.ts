// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TupleIndices<T extends readonly any[]> =
  Extract<keyof T, `${number}`> extends `${infer N extends number}` ? N : never;
