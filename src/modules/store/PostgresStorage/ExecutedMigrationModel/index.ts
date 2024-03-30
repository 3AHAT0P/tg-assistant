import { Pool } from 'pg';

import { inject } from '#lib/DI';

import { PostgresConnectionInjectionToken } from '../provider';

import { tableName } from './tableName';

export const migrationTableName = tableName;

export const getExectutedMigrations = async (connection: Pool): Promise<string[]> => {
  const sql = `SELECT name FROM ${tableName} ORDER BY created_at`;
  const values: string[] = [];

  const res = await connection.query<{ name: string }>({ text: sql, values });

  return res.rows.map(({ name }) => name);
};

export const createExectutedMigration = async (connection: Pool, name: string): Promise<void> => {
  const sql = `INSERT INTO  ${tableName} (name) VALUES ($1)`;
  const values: string[] = [name];

  await connection.query({ text: sql, values });
};

export const deleteExectutedMigration = async (connection: Pool, name: string): Promise<void> => {
  const sql = `DELETE FROM  ${tableName} WHERE name = $1`;
  const values: string[] = [name];

  await connection.query({ text: sql, values });
};

interface ExecutedMigrationRepository {
  readonly getAll: () => Promise<string[]>;
  readonly createOne: (name: string) => Promise<void>;
  readonly deleteOne: (name: string) => Promise<void>;
}

export const getExecutedMigrationRepository = async (): Promise<ExecutedMigrationRepository> => {
  const pgConnection = inject(PostgresConnectionInjectionToken);

  return <const>{
    getAll: getExectutedMigrations.bind(null, pgConnection),
    createOne: createExectutedMigration.bind(null, pgConnection),
    deleteOne: deleteExectutedMigration.bind(null, pgConnection),
  };
};
