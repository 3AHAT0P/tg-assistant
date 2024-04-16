import { Pool, escapeIdentifier, escapeLiteral } from 'pg';

import { inject } from '#lib/DI';
import { isNullOrUndefined, typeKey } from '#utils';

import { PostgresConnectionInjectionToken } from '../provider';

import { tableName } from './tableName';
import { UserModel } from './@types';

export type UserModelQueryConditions<T extends object = object> = {
  isEnabled?: UserModel['isEnabled'];
} & T;

const columnMap: Record<string, string> = {
  firstName: 'first_name',
  lastName: 'last_name',
  tgId: 'tg_id',
  timezone: 'zone',
  locale: 'locale',
  isEnabled: 'is_enabled',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

const getColumns = (): string[] => {
  return [
    'id',
    'first_name as "firstName"',
    'last_name as "lastName"',
    'tg_id as "tgId"',
    'zone as timezone',
    'locale',
    'is_enabled as "isEnabled"',
    'created_at as "createdAt"',
    'updated_at as "updatedAt"',
  ];
};

const getAll = async (connection: Pool, conditions?: UserModelQueryConditions): Promise<UserModel[]> => {
  const query = {
    select: getColumns(),
    from: tableName,
    where: [] as string[],
    orderBy: ['created_at ASC'],
  };

  if (!isNullOrUndefined(conditions)) {
    if (!isNullOrUndefined(conditions.isEnabled)) {
      query.where.push(`is_enabled = ${conditions.isEnabled}`);
    }
  }

  let sql = `
    SELECT ${query.select.join(', ')}
    FROM ${query.from};`;

  if (query.where.length > 0) sql += `\nWHERE ${query.where.join(' and ')}`;
  if (query.orderBy.length > 0) sql += `\nORDER BY ${query.orderBy.join(', ')}`;

  const res = await connection.query<UserModel>(sql);

  return res.rows;
};

const findById = async (
  connection: Pool,
  conditions: UserModelQueryConditions<{ id: UserModel['id']}>,
): Promise<UserModel | null> => {
  const query = {
    select: getColumns(),
    from: tableName,
    where: [`id = ${escapeLiteral(conditions.id)}`],
    limit: 1,
  };

  if (!isNullOrUndefined(conditions.isEnabled)) {
    query.where.push(`is_enabled = ${conditions.isEnabled}`);
  }

  const sql = `
    SELECT ${query.select.join(', ')}
    FROM ${query.from}
    WHERE ${query.where.join(' and ')}
    LIMIT ${query.limit};`;

  const res = await connection.query<UserModel>(sql);

  return res.rows[0] ?? null;
};

const findByTGId = async (
  connection: Pool,
  conditions: UserModelQueryConditions<{ tgId: UserModel['tgId']}>,
): Promise<UserModel | null> => {
  const query = {
    select: getColumns(),
    from: tableName,
    where: [`tg_id = ${escapeLiteral(conditions.tgId)}`],
    limit: 1,
  };

  if (!isNullOrUndefined(conditions.isEnabled)) {
    query.where.push(`is_enabled = ${conditions.isEnabled}`);
  }

  const sql = `
    SELECT ${query.select.join(', ')}
    FROM ${query.from}
    WHERE ${query.where.join(' and ')}
    LIMIT ${query.limit};`;

  const res = await connection.query<UserModel>(sql);

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
    columns.push(escapeIdentifier(columnMap[key] ?? key));
    valuesIndexes.push(`$${index}`);
    values.push(value);
    index += 1;
  }

  const sql = `INSERT INTO ${tableName}
  (${ columns.join(', ')})
  VALUES (${valuesIndexes.join(', ')})
  RETURNING ${getColumns().join(', ')};
  `;

  const response = await connection.query<UserModel, typeof values>({ text: sql, values });

  return response.rows;
};

const deleteById = async (connection: Pool, id: UserModel['id']): Promise<void> => {
  const sql = `DELETE FROM ${tableName} WHERE id = $1`;
  const values: string[] = [id];

  await connection.query({ text: sql, values });
};

export const getUserRepository = () => {
  const pgConnection = inject(PostgresConnectionInjectionToken);

  return <const>{
    [typeKey]: 'UserRepository',
    getAll: getAll.bind(null, pgConnection),
    findById: findById.bind(null, pgConnection),
    findByTGId: findByTGId.bind(null, pgConnection),
    createOne: createOne.bind(null, pgConnection),
    deleteById: deleteById.bind(null, pgConnection),
  };
};

export type UserRepository = ReturnType<typeof getUserRepository>;
