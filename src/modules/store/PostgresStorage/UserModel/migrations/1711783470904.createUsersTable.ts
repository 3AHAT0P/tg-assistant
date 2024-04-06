import { type Pool } from 'pg';

import { tableName } from '../tableName';

const sqlUp = `CREATE TABLE ${tableName} (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name varchar(255) NOT NULL,
  last_name varchar(255) NULL,
  tg_id varchar(12) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const sqlDown = `DROP TABLE ${tableName}`;

export const createUsersTable = <const>{
  async up(connection: Pool): Promise<void> {
    await connection.query(sqlUp);
  },
  async down(connection: Pool): Promise<void> {
    await connection.query(sqlDown);
  },
};
