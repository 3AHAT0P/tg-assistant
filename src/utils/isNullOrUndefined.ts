export const isNullOrUndefined = (value: unknown): value is (null | void) => value === null || value === undefined;
