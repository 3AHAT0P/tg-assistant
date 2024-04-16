import { type Pool } from 'pg';

import { inject } from '#lib/DI';
import { configInjectionToken } from '#module/config';

import { tableName } from '../tableName';

const sqlDown = `ALTER TABLE ${tableName} DROP COLUMN zone, DROP COLUMN locale;`;

export const addZoneAndLocaleToUser = <const>{
  async up(connection: Pool): Promise<void> {
    const config = inject(configInjectionToken);
    const sqlUp = `ALTER TABLE ${tableName}
      ADD COLUMN zone varchar(255) NULL DEFAULT '${config.defaultTimezone}',
      ADD COLUMN locale varchar(255) NULL DEFAULT '${config.defaultLocale}';
    `;
    await connection.query(sqlUp);
  },
  async down(connection: Pool): Promise<void> {
    await connection.query(sqlDown);
  },
};
