import { stringToBoolean } from '#utils';

import type { Config } from './@types';

export const loader = async (): Promise<Config> => {
  const isProdMode = stringToBoolean(process.env['IS_PROD_MODE']) ?? false;

  // @ts-expect-error file may be except
  if (isProdMode) return (await import('./config.prod')).config;

  try {
    // @ts-expect-error file may be except
    return (await import('./config.dev')).config;
  } catch (error) {
    console.log(error);
    // @ts-expect-error file may be except
    return (await import('./config.prod')).config;
  }
};

export {
  Config,
};
