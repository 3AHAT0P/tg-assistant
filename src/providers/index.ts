import { provider as configProvider } from '#module/config';
import { provider as tgProvider } from '#module/transport-telegram';
import { onlineMeetingStoreProvider } from '#module/store';
import { provider as schedulerProvider } from '#module/scheduler';
import { provider as postgresConnectionProvider } from '#module/store/PostgresStorage/provider';
import { provider as userRepositoryProvider } from '#module/store/PostgresStorage/UserModel';
import { provider as eventRepositoryProvider } from '#module/store/PostgresStorage/EventModel';

const providers = <const>[
  configProvider,
  postgresConnectionProvider,
  userRepositoryProvider,
  eventRepositoryProvider,
  tgProvider,
  onlineMeetingStoreProvider,
  schedulerProvider,
];

export const initProviders = async () => {
  for (const initProvider of providers) await initProvider();
};
