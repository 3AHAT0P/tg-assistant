import { provider as loggerProvider } from '#module/logger';
import { provider as configProvider } from '#module/config';
import { provider as tgProvider } from '#module/transport-telegram';
import { provider as schedulerProvider } from '#module/scheduler';
import { providers as storeProviders } from '#module/store';
import { provider as transportHTTPProvider } from '#module/transport-http';

const providers = <const>[
  configProvider,
  loggerProvider,
  ...storeProviders,
  tgProvider,
  schedulerProvider,
  transportHTTPProvider,
];

export const initProviders = async () => {
  for (const initProvider of providers) await initProvider();
};
