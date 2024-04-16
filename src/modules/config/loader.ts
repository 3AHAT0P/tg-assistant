import { stringToBoolean } from '#utils';

import type { Config } from './@types';

// @TODO(ikos) Code too much complexity. Refactor it!
export const loader = async (): Promise<Config> => {
  const isProdMode = stringToBoolean(process.env['IS_PROD_MODE']) ?? false;
  const isCompiled = stringToBoolean(process.env['IS_COMPILED']) ?? true;

  const configProdFilePath = `./config.prod.${isCompiled ? 'js' : 'ts'}`;
  const configDevFilePath = `./config.dev.${isCompiled ? 'js' : 'ts'}`;

  if (isProdMode) return (await import(configProdFilePath)).config;

  try {
    return (await import(configDevFilePath)).config;
  } catch (error) {
    console.log(error);
    return (await import(configProdFilePath)).config;
  }
};

export {
  Config,
};
