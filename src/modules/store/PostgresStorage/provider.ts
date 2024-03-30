import { InjectionToken, provide } from '#lib/DI';
import { Pool } from 'pg';

import { buildConnection } from './buildConnection';
import { migrate, rollback } from './migrationDirector';

export const PostgresConnectionInjectionToken: InjectionToken<Pool> = {
  id: Symbol('PostgresConnection'),
  guard(value: unknown): value is Pool {
    return value instanceof Pool;
  },
};

export const provider = async (): Promise<void> => {
  const pool = await buildConnection();

  await migrate(pool);

  // await rollback(pool, 1);

  provide(PostgresConnectionInjectionToken, pool);
};
