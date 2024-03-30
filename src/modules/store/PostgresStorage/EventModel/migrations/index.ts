import type { MigrationList } from '#module/store/@types/Migration';

import { createEventsTable } from './1711789557244.createEventsTable';

export const eventModelMigrationList: MigrationList = [
  ['1711789557244.createEventsTable', createEventsTable],
];
