import { stringToBoolean, stringToNumber, stringToString, throwError } from '#utils';

import { Config } from './@types';

export const config: Config = <const>{
  isProdMode: stringToBoolean(process.env['IS_PROD_MODE']) ?? false,
  logLevel: stringToNumber(process.env['LOG_LEVEL']) ?? 2,
  tgBotToken: stringToString(process.env['TG_BOT_TOKEN']) ?? throwError('Environment variable TG_BOT_TOKEN is required!'),
  scheduleRunDelay: stringToNumber(process.env['SCHEDULE_RUN_DELAY']) ?? 5 * 60 * 1000, // 5 minutes
  defaultTimezone: stringToString(process.env['DEFAULT_TIMEZONE']) ?? 'Europe/Moscow',
  defaultLocale: stringToString(process.env['DEFAULT_LOCALE']) ?? 'ru-RU',
  postgres: {
    host: stringToString(process.env['POSTGRES_HOST']) ?? 'localhost',
    port: stringToNumber(process.env['POSTGRES_PORT']) ?? 5432,
    db: stringToString(process.env['POSTGRES_DB']) ?? 'tg_assistant',
    user: stringToString(process.env['POSTGRES_USER']) ?? throwError('Environment variable POSTGRES_USER is required!'),
    password: stringToString(process.env['POSTGRES_PASSWORD']) ?? throwError('Environment variable POSTGRES_PASSWORD is required!'),
  },
};
