import { Pool, escapeIdentifier } from 'pg';

import { inject } from '#lib/DI';

import { PostgresConnectionInjectionToken } from '../provider';

import { tableName } from './tableName';
import { UserModel } from './@types';

const getAll = async (connection: Pool): Promise<UserModel[]> => {
  const sql = `
  SELECT id,
    first_name as "firstName", 
    last_name as "lastName",
    tg_id as "tgId",
    created_at as "createdAt",
    updated_at as "updatedAt",
  FROM ${tableName}`;

  const values: never[] = [];

  const res = await connection.query<UserModel, typeof values>({ text: sql, values });

  return res.rows;
};

const findById = async (connection: Pool, id: UserModel['id']): Promise<UserModel | null> => {
  const sql = `
  SELECT id,
    first_name as "firstName", 
    last_name as "lastName",
    tg_id as "tgId",
    created_at as "createdAt",
    updated_at as "updatedAt",
  FROM ${tableName}
  WHERE id=$1
  LIMIT 1`;

  const values: [UserModel['id']] = [id];

  const res = await connection.query<UserModel, typeof values>({ text: sql, values });

  return res.rows[0] ?? null;
};

const findByTGId = async (connection: Pool, tgId: UserModel['tgId']): Promise<UserModel | null> => {
  const sql = `
  SELECT id,
    first_name as "firstName", 
    last_name as "lastName",
    tg_id as "tgId",
    created_at as "createdAt",
    updated_at as "updatedAt",
  FROM ${tableName}
  WHERE tg_id=$1
  LIMIT 1`;

  const values: [UserModel['tgId']] = [tgId];

  const res = await connection.query<UserModel, typeof values>({ text: sql, values });

  return res.rows[0] ?? null;
};

const createOne = async (
  connection: Pool,
  data: Omit<UserModel, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<UserModel[]> => {
  const columns: string[] = [];
  const values: unknown[] = [];

  const valuesIndexes: string[] = [];
  let index = 1;
  for (const [key, value] of Object.entries(data)) {
    columns.push(escapeIdentifier(key));
    valuesIndexes.push(`$${index}`);
    values.push(value);
    index += 1;
  }
  
  const sql = `INSERT INTO ${tableName}
  (${ columns.join(', ')})
  VALUES (${valuesIndexes.join(', ')})
  RETURNED id,
    first_name as "firstName", 
    last_name as "lastName",
    tg_id as "tgId",
    created_at as "createdAt",
    updated_at as "updatedAt";
  `;

  const response = await connection.query<UserModel, typeof values>({ text: sql, values });

  return response.rows;
};

const deleteById = async (connection: Pool, id: UserModel['id']): Promise<void> => {
  const sql = `DELETE FROM ${tableName} WHERE id = $1`;
  const values: string[] = [id];

  await connection.query({ text: sql, values });
};

export const getUserRepository = async () => {
  const pgConnection = inject(PostgresConnectionInjectionToken);

  return <const>{
    [Symbol.for('[[type]]')]: 'UserRepository',
    getAll: getAll.bind(null, pgConnection),
    findById: findById.bind(null, pgConnection),
    findByTGId: findByTGId.bind(null, pgConnection),
    createOne: createOne.bind(null, pgConnection),
    deleteById: deleteById.bind(null, pgConnection),
  };
};

export type UserRepository = ReturnType<typeof getUserRepository>;
