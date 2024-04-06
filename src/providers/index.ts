import { provider as configProvider } from '#module/config';
import { provider as tgProvider } from '#module/transport-telegram';
import { provider as schedulerProvider } from '#module/scheduler';
import { providers as storeProviders } from '#module/store';

const providers = <const>[
  configProvider,
  ...storeProviders,
  tgProvider,
  schedulerProvider,
];

export const initProviders = async () => {
  for (const initProvider of providers) await initProvider();
};
