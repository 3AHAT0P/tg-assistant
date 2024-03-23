export const sanitazeTGMessage = (value: string): string => {
  return value.replaceAll(/[-().+]/g, '\\$&');
};
