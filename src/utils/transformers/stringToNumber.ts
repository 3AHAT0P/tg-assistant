export const stringToNumber = (value?: string): number | null => {
  const result = Number(value);
  if (Number.isNaN(result)) return null;
  return result;
};
