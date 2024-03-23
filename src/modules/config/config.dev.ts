import { stringToString, throwError } from '#utils';

import { Config } from './@types';

export const config: Config = <const>{
  isProdMode: false,
  logLevel: 0,
  tgBotToken: stringToString(process.env['TG_BOT_TOKEN']) ?? throwError('Environment variable TG_BOT_TOKEN is required!'),
  scheduleRunDelay: 5 * 60 * 1000, // 5 minutes,
  defaultTimezone: 'Europe/Moscow',
  defaultLocale: 'ru-RU',
};
