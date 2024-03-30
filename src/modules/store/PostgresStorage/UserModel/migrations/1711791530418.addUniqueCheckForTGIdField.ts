import { type Pool } from 'pg';

import { tableName } from '../tableName';

const sqlUp = `ALTER TABLE ${tableName} ADD CONSTRAINT tg_id_unique_constraint UNIQUE(tg_id);`;

const sqlDown = `ALTER TABLE ${tableName} DROP CONSTRAINT tg_id_unique_constraint;`;

export const addUniqueCheckForTGIdField = <const>{
  async up(connection: Pool): Promise<void> {
    await connection.query(sqlUp);
  },
  async down(connection: Pool): Promise<void> {
    await connection.query(sqlDown);
  },
};
