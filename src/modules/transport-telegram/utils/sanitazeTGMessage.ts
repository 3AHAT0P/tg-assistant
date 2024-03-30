export const sanitazeTGMessage = (value: string): string => {
  return value.replaceAll(/[-().+_[\]]/g, '\\$&');
};
