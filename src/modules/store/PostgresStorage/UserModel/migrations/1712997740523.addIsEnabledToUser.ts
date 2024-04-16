import { type Pool } from 'pg';

import { tableName } from '../tableName';

const sqlUp = `ALTER TABLE ${tableName}
      ADD COLUMN is_enabled boolean NOT NULL DEFAULT false;
    `;
const sqlDown = `ALTER TABLE ${tableName} DROP COLUMN is_enabled;`;

export const addIsEnabledToUser = <const>{
  async up(connection: Pool): Promise<void> {
    await connection.query(sqlUp);
  },
  async down(connection: Pool): Promise<void> {
    await connection.query(sqlDown);
  },
};
