export const stringToString = (value?: string): string | null => {
  if (value === undefined
    || value === null
    || value === '') return null;

  return value;
};
