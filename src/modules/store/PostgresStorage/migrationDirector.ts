import { Pool } from 'pg';

import type { MigrationList } from '#module/store/@types/Migration';
import { isNullOrUndefined } from '#utils';

import { createExectutedMigration, deleteExectutedMigration, getExectutedMigrations, migrationTableName } from './ExecutedMigrationModel';
import { createMigrationsTable } from './ExecutedMigrationModel/migrations';

import { userModelMigrationList } from './UserModel/migrations';
import { eventModelMigrationList } from './EventModel/migrations';

const migrationList: MigrationList = [
  ...userModelMigrationList,
  ...eventModelMigrationList,
].sort(([aName], [bName]) => {
  if (aName > bName) return 1;
  if (aName < bName) return -1;
  return 0;
});

/**
 * Checks if a table exists in the database.
 *
 * @param {Pool} connection - the database connection pool
 * @param {string} tableName - the name of the table to check
 * @return {Promise<boolean>} whether the table exists or not
 */
const tableIsExists = async (connection: Pool, tableName: string): Promise<boolean> => {
  const sql = 'SELECT table_name FROM information_schema.tables WHERE table_name = $1';

  let _tableName = tableName;
  if (_tableName.at(0) === '"' && _tableName.at(-1) === '"') _tableName = _tableName.slice(1, -1);

  const values = [_tableName];

  const res = await connection.query({ text: sql, values });

  return res.rows.length > 0;
};

/**
 * Asynchronously migrates the database using the provided connection pool. 
 *
 * @param {Pool} connection - the connection pool for the database
 * @return {Promise<void>} a promise that resolves when the migration is complete
 */
export const migrate = async (connection: Pool): Promise<void> => {
  if (!(await tableIsExists(connection, migrationTableName))) await createMigrationsTable.up(connection);

  const executedMigrationList = await getExectutedMigrations(connection);

  const executedMigrations: Record<string, boolean> = {};

  for (const name of executedMigrationList) executedMigrations[name] = true;

  for (const [name, runner] of migrationList) {
    if (name in executedMigrations) continue;

    await runner.up(connection);

    await createExectutedMigration(connection, name);
  }
};

/**
 * Rolls back a specified number of executed migrations in the database.
 *
 * @param {Pool} connection - The database connection pool.
 * @param {number} count - The number of migrations to roll back.
 * @return {Promise<string[]>} An array of names of rolled back migrations.
 */
export const rollback = async (connection: Pool, count: number): Promise<string[]> => {
  if (!(await tableIsExists(connection, migrationTableName))) return [];

  const executedMigrationList = await getExectutedMigrations(connection);
  const result: string[] = [];

  for (const name of executedMigrationList.slice(-count).reverse()) {
    const migration = migrationList.find((record) => record[0] === name);
    if (isNullOrUndefined(migration)) continue;
    
    const migrationRunner = migration[1];

    await migrationRunner.down(connection);

    await deleteExectutedMigration(connection, name);
    result.push(name);
  }

  return result;
};
