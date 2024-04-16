import { stringToNumber, stringToString, throwError } from '#utils';

import { Config } from './@types';

export const config: Config = <const>{
  isProdMode: false,
  logLevel: 0,
  tgBotToken: stringToString(process.env['TG_BOT_TOKEN']) ?? throwError('Environment variable TG_BOT_TOKEN is required!'),
  scheduleRunDelay: 5 * 60 * 1000, // 5 minutes,
  defaultTimezone: 'Europe/Moscow',
  defaultLocale: 'ru-RU',
  postgres: {
    host: 'localhost',
    port: 5432,
    db: 'tg_assistant',
    user: 'main',
    password: 'main',
    runMigrations: true,
    rollbackMigrations: 0,
  },
  self: {
    host: stringToString(process.env['SELF_HOST']) ?? 'http://localhost',
    port: stringToNumber(process.env['SELF_PORT']) ?? 3001,
    publicHost: stringToString(process.env['SELF_PUBLIC_HOST']) ?? 'http://cucumber.loc',
    publicPort: stringToNumber(process.env['SELF_PUBLIC_PORT']) ?? 3001,
  },
};
