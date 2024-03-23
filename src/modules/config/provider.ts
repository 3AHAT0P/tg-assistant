import { provide, InjectionToken } from '#lib/DI';

import type { Config } from './@types';
import { loader } from './loader';

export const configInjectionToken: InjectionToken<Config> = {
  id: Symbol('Config'),
  guard(value: unknown): value is Config {
    return typeof value === 'object' && value != null && 'isProdMode' in value && 'logLevel' in value;
  },
};

export const provider = async (): Promise<void> => {
  const config = await loader();

  provide(configInjectionToken, config);
};
