import { Pool, escapeIdentifier } from 'pg';

import { inject } from '#lib/DI';

import { PostgresConnectionInjectionToken } from '../provider';

import { tableName } from './tableName';
import { EventModel } from './@types';
import { configInjectionToken } from '#module/config';

const getAll = async (connection: Pool): Promise<EventModel[]> => {
  const sql = `
  SELECT id,
    name,
    link,
    start_at as "startAt",
    repeat,
    user_id as "userId",
    created_at as "createdAt",
    updated_at as "updatedAt",
  FROM ${tableName}`;

  const values: never[] = [];

  const res = await connection.query<EventModel, typeof values>({ text: sql, values });

  return res.rows;
};

const findById = async (connection: Pool, id: EventModel['id']): Promise<EventModel | null> => {
  const sql = `
  SELECT id,
    name,
    link,
    start_at as "startAt",
    repeat,
    user_id as "userId",
    created_at as "createdAt",
    updated_at as "updatedAt",
  FROM ${tableName}
  WHERE id=$1
  LIMIT 1`;

  const values: [EventModel['id']] = [id];

  const res = await connection.query<EventModel, typeof values>({ text: sql, values });

  console.log(res.rows);

  return res.rows[0] ?? null;
};

const getCloseToTime = async (connection: Pool, datetime: Date): Promise<EventModel | null> => {
  const config = inject(configInjectionToken);

  const sql = `
  SELECT id,
    name,
    link,
    start_at as "startAt",
    repeat,
    user_id as "userId",
    created_at as "createdAt",
    updated_at as "updatedAt",
  FROM ${tableName}
  WHERE
    EXTRACT(EPOCH from (created_at - $1)) > -60
    and EXTRACT(EPOCH from (created_at - $1)) < ${Math.trunc(config.scheduleRunDelay * 2 / 1000)}
  ;`;

  const values: [string] = [datetime.toISOString()];

  const res = await connection.query<EventModel, typeof values>({ text: sql, values });

  return res.rows[0] ?? null;
};

const createOne = async (
  connection: Pool,
  data: Omit<EventModel, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<EventModel[]> => {
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
    name,
    link,
    start_at as "startAt",
    repeat,
    user_id as "userId",
    created_at as "createdAt",
    updated_at as "updatedAt";
  `;

  const response = await connection.query<EventModel, typeof values>({ text: sql, values });

  return response.rows;
};

const deleteById = async (connection: Pool, id: EventModel['id']): Promise<void> => {
  const sql = `DELETE FROM ${tableName} WHERE id = $1`;
  const values: string[] = [id];

  await connection.query({ text: sql, values });
};

export const getEventRepository = async () => {
  const pgConnection = inject(PostgresConnectionInjectionToken);

  return <const>{
    [Symbol.for('[[type]]')]: 'EventRepository',
    getAll: getAll.bind(null, pgConnection),
    findById: findById.bind(null, pgConnection),
    getCloseToTime: getCloseToTime.bind(null, pgConnection),
    createOne: createOne.bind(null, pgConnection),
    deleteById: deleteById.bind(null, pgConnection),
  };
};

export type EventRepository = ReturnType<typeof getEventRepository>;
