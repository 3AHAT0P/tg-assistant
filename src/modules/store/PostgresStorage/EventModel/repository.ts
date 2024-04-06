import { Pool, escapeIdentifier, escapeLiteral } from 'pg';

import { inject } from '#lib/DI';

import { PostgresConnectionInjectionToken } from '../provider';

import { tableName } from './tableName';
import { EventModel } from './@types';
import { configInjectionToken } from '#module/config';
import { isNullOrUndefined, typeKey } from '#utils';

export type EventModelQueryConditions<T extends object = object> = {
  userId?: EventModel['userId'];
} & T;

const columnMap: Record<string, string> = {
  name: 'name',
  link: 'link',
  repeat: 'repeat',
  startAt: 'start_at',
  userId: 'user_id',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

const getColumns = (): string[] => {
  return [
    'id',
    'name',
    'link',
    'start_at as "startAt"',
    'repeat',
    'user_id as "userId"',
    'created_at as "createdAt"',
    'updated_at as "updatedAt"',
  ];
};

const getAll = async (
  connection: Pool,
  conditions?: EventModelQueryConditions<{ startAt?: Date | [Date, Date] }>,
): Promise<EventModel[]> => {
  const query = {
    select: getColumns(),
    from: tableName,
    where: [] as string[],
    orderBy: ['start_at ASC'],
  };

  if (!isNullOrUndefined(conditions)) {
    if (!isNullOrUndefined(conditions.userId)) {
      query.where.push(`user_id = ${escapeLiteral(conditions.userId)}`);
    }
    if (!isNullOrUndefined(conditions.startAt)) {
      if (Array.isArray(conditions.startAt)) {
        query.where.push(`start_at >= ${escapeLiteral(conditions.startAt[0].toISOString())}`);
        query.where.push(`start_at <= ${escapeLiteral(conditions.startAt[1].toISOString())}`);
      } else query.where.push(`start_at >= ${escapeLiteral(conditions.startAt.toISOString())}`);
    }
  }

  let sql = `
    SELECT ${query.select.join(', ')}
    FROM ${query.from}`;
  
  if (query.where.length > 0) sql += `\nWHERE ${query.where.join(' and ')}`;
  if (query.orderBy.length > 0) sql += `\nORDER BY ${query.orderBy.join(', ')}`;

  const res = await connection.query<EventModel>(sql);

  return res.rows;
};

const findById = async (connection: Pool, conditions: EventModelQueryConditions<{ id: EventModel['id'] }>): Promise<EventModel | null> => {
  const query = {
    select: getColumns(),
    from: tableName,
    where: [
      `id = ${escapeLiteral(conditions.id)}`,
    ],
    limit: 1,
  };

  if (!isNullOrUndefined(conditions.userId)) {
    query.where.push(`user_id = ${escapeLiteral(conditions.userId)}`);
  }

  const sql = `
    SELECT ${query.select.join(', ')}
    FROM ${query.from}
    WHERE ${query.where.join(' and ')}
    LIMIT ${query.limit};`;

  const res = await connection.query<EventModel>(sql);

  return res.rows[0] ?? null;
};

const getCloseToTime = async (
  connection: Pool,
  conditions: EventModelQueryConditions<{ datetime: Date, range: [number, number] }>,
): Promise<EventModel[]> => {
  const escapedDateTime = escapeLiteral(conditions.datetime.toISOString());
  const escapedMinTimeRange = conditions.range[0]; 
  const escapedMaxTimeRange = conditions.range[1];

  const query = {
    select: getColumns(),
    from: tableName,
    where: [
      `EXTRACT(EPOCH from (start_at - ${escapedDateTime})) > ${escapedMinTimeRange}`,
      `EXTRACT(EPOCH from (start_at - ${escapedDateTime})) < ${escapedMaxTimeRange}`
    ],
    orderBy: ['start_at ASC'],
  };

  if (!isNullOrUndefined(conditions.userId)) {
    query.where.push(`user_id = ${escapeLiteral(conditions.userId)}`);
  }

  const sql = `
    SELECT ${query.select.join(', ')}
    FROM ${query.from}
    WHERE ${query.where.join(' and ')}
    ORDER BY ${query.orderBy.join(', ')}`;

  const res = await connection.query<EventModel>(sql);

  return res.rows;
};

const createOne = async (
  connection: Pool,
  data: Omit<EventModel, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<EventModel | null> => {
  const columns: string[] = [];
  const values: unknown[] = [];

  const valuesIndexes: string[] = [];
  let index = 1;
  for (const [key, value] of Object.entries(data)) {
    columns.push(escapeIdentifier(columnMap[key] ?? key));
    valuesIndexes.push(`$${index}`);
    values.push(value);
    index += 1;
  }
  
  const sql = `INSERT INTO ${tableName}
  (${ columns.join(', ')})
  VALUES (${valuesIndexes.join(', ')})
  RETURNING ${getColumns().join(', ')}
  ;`;

  const response = await connection.query<EventModel, typeof values>({ text: sql, values });

  if (response.rows.length === 0) console.log('@@@@@@@@@@@@@@@@@@@ ERROR!');
  return response.rows[0] ?? null;
};

const deleteById = async (connection: Pool, id: EventModel['id']): Promise<EventModel | null> => {
  const sql = `DELETE FROM ${tableName}
  WHERE id = $1
  RETURNING ${getColumns().join(', ')}
  ;`;
  const values: string[] = [id];

  const response = await connection.query<EventModel, typeof values>({ text: sql, values });

  if (response.rows.length === 0) console.log('@@@@@@@@@@@@@@@@@@@ ERROR!');
  return response.rows[0] ?? null;
};

export const getEventRepository = () => {
  const pgConnection = inject(PostgresConnectionInjectionToken);

  return <const>{
    [typeKey]: 'EventRepository',
    getAll: getAll.bind(null, pgConnection),
    findById: findById.bind(null, pgConnection),
    getCloseToTime: getCloseToTime.bind(null, pgConnection),
    createOne: createOne.bind(null, pgConnection),
    deleteById: deleteById.bind(null, pgConnection),
  };
};

export type EventRepository = ReturnType<typeof getEventRepository>;
