import { stringToBoolean, stringToNumber, stringToString, throwError } from '#utils';

import { Config } from './@types';

export const config: Config = <const>{
  isProdMode: stringToBoolean(process.env['IS_PROD_MODE']) ?? false,
  logLevel: stringToNumber(process.env['LOG_LEVEL']) ?? 2,
  tgBotToken: stringToString(process.env['TG_BOT_TOKEN']) ?? throwError('Environment variable TG_BOT_TOKEN is required!'),
  scheduleRunDelay: stringToNumber(process.env['SCHEDULE_RUN_DELAY']) ?? 5 * 60 * 1000, // 5 minutes
};
