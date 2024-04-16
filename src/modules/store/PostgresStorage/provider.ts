import { Pool } from 'pg';

import { InjectionToken, inject, provide } from '#lib/DI';
import { configInjectionToken } from '#module/config';

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
  const config = inject(configInjectionToken);

  if (config.postgres.runMigrations) await migrate(pool);

  if (config.postgres.rollbackMigrations > 0) await rollback(pool, config.postgres.rollbackMigrations);

  provide(PostgresConnectionInjectionToken, pool);
};

