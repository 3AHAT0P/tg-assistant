import { Pool } from 'pg';

import { tableName } from '../tableName';


const sqlUp = `
CREATE TYPE event_repeat_type AS ENUM ('workdays', 'weekly', 'monthly');
CREATE TABLE ${tableName} (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  link text NOT NULL,
  start_at timestamp with time zone NOT NULL,
  repeat event_repeat_type NULL,
  user_id uuid NOT NULL REFERENCES users (id),
  created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);`;

const sqlDown = `
  DROP TABLE ${tableName};
  DROP TYPE event_repeat_type;
`;

export const createEventsTable = <const>{
  async up(connection: Pool): Promise<void> {
    await connection.query(sqlUp);
  },
  async down(connection: Pool): Promise<void> {
    await connection.query(sqlDown);
  },
};
