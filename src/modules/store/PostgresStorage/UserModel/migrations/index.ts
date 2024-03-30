import type { MigrationList } from '#module/store/@types/Migration';

import { createUsersTable } from './1711783470904.createUsersTable';
import { addUniqueCheckForTGIdField } from './1711791530418.addUniqueCheckForTGIdField';

export const userModelMigrationList: MigrationList = [
  ['1711783470904.createUsersTable', createUsersTable],
  ['1711791530418.addUniqueCheckForTGIdField', addUniqueCheckForTGIdField],
];
