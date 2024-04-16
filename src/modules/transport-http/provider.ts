import { InjectionToken, inject, provide } from '#lib/DI';
import { configInjectionToken } from '#module/config';

import { loggerInjectionToken } from '#module/logger';
import { requestHandler } from './requestHandler';
import { createServer } from 'http';

interface TransportHTTP {
  isTransportHTTP: boolean;
  close(): void;
}

export const tgBotInjectionToken: InjectionToken<TransportHTTP> = {
  id: Symbol('TransportHTTP'),
  guard(value: unknown): value is TransportHTTP {
    return typeof value === 'object' && value != null && 'isTransportHTTP' in value && value.isTransportHTTP === true;
  },
};

export const provider = async (): Promise<void> => {
  const config = inject(configInjectionToken);

  const server = createServer(requestHandler);

  server.listen(config.self.port);

  const logger = inject(loggerInjectionToken);

  logger.info(['Transport HTTP', 'provider'], 'Server is started!');

  provide(tgBotInjectionToken, {
    isTransportHTTP: true,
    close() {
      server.close(() => logger.info(['Transport HTTP', 'close callback'], 'HTTP server closed'));
    }
  });
};
