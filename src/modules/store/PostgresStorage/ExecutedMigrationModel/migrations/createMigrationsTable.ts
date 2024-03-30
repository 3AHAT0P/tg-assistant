import { Pool } from 'pg';

import { tableName } from '../tableName';

const sqlUp = `create table ${tableName} (
  name varchar(255) PRIMARY KEY,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const sqlDown = `DROP TABLE ${tableName}`;

export const createMigrationsTable = <const>{
  async up(connection: Pool): Promise<void> {
    await connection.query(sqlUp);
  },
  async down(connection: Pool): Promise<void> {
    await connection.query(sqlDown);
  },
};
