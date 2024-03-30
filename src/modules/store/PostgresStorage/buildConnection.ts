import { inject } from '#lib/DI';
import { configInjectionToken } from '#module/config';
import { Pool } from 'pg';

export const buildConnection = async (): Promise<Pool> => {
  const { host, port, db, user, password } = inject(configInjectionToken).postgres;
  const pool = new Pool({
    host,
    port,
    database: db,
    user,
    password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  return pool;
};

