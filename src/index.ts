import { Settings } from 'luxon';

import { initProviders } from './providers';

const main = async (): Promise<void> => {
  Settings.defaultZone = 'utc';
  await initProviders();
};

main();
