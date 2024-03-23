import { provider as configProvider } from '#module/config';
import { provider as tgProvider } from '#module/transport-telegram';
import { onlineMeetingStoreProvider } from '#module/store';
import { provider as schedulerProvider } from '#module/scheduler';

const providers = <const>[
  configProvider,
  tgProvider,
  onlineMeetingStoreProvider,
  schedulerProvider,
];

export const initProviders = async () => {
  for (const initProvider of providers) await initProvider();
};
