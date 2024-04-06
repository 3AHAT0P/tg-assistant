import { provider as postgresConnectionProvider } from './PostgresStorage/provider';
import { provider as userRepositoryProvider } from './PostgresStorage/UserModel';
import { provider as eventRepositoryProvider } from './PostgresStorage/EventModel';

export const providers = <const>[
  postgresConnectionProvider,
  userRepositoryProvider,
  eventRepositoryProvider,
];
