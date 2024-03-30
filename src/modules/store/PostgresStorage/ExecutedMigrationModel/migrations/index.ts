import type { MigrationList } from '#module/store/@types/Migration';

import { createMigrationsTable } from './createMigrationsTable';

export {
  createMigrationsTable 
};

export const ExecutedMigrationModelMigrationList: MigrationList = [
  ['createMigrationsTable', createMigrationsTable],
];
