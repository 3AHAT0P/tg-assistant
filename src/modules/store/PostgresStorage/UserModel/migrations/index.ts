import type { MigrationList } from '#module/store/@types/Migration';

import { createUsersTable } from './1711783470904.createUsersTable';
import { addUniqueCheckForTGIdField } from './1711791530418.addUniqueCheckForTGIdField';
import { addZoneAndLocaleToUser } from './1712992939834.addZoneAndLocaleToUser';
import { addIsEnabledToUser } from './1712997740523.addIsEnabledToUser';

export const userModelMigrationList: MigrationList = [
  ['1711783470904.createUsersTable', createUsersTable],
  ['1711791530418.addUniqueCheckForTGIdField', addUniqueCheckForTGIdField],
  ['1712992939834.addZoneAndLocaleToUser', addZoneAndLocaleToUser],
  ['1712997740523.addIsEnabledToUser', addIsEnabledToUser],
];
