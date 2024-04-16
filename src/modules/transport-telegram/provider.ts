import { Bot } from 'grammy';

import { InjectionToken, inject, provide } from '#lib/DI';
import { configInjectionToken } from '#module/config';

import type { TGBot } from './@types';
import { registerOnStartHandler } from './handlers/onStart';
import { registerOnCreateMeetingHandler } from './handlers/onCreateMeeting';
import { registerOnGetActiveEventsHandler } from './handlers/onGetActiveEvents';
import { registerOnDeleteEventHandler } from './handlers/onDeleteEvent';
import { registerOnGetEventsHandler } from './handlers/onGetEvents';
import { loggerInjectionToken } from '#module/logger';

export const tgBotInjectionToken: InjectionToken<TGBot> = {
  id: Symbol('TGBot'),
  guard(value: unknown): value is TGBot {
    return typeof value === 'object' && value != null && value instanceof Bot;
  },
};

export const provider = async (): Promise<void> => {
  const config = inject(configInjectionToken);

  const bot = new Bot(config.tgBotToken);
  bot.start();

  provide(tgBotInjectionToken, bot);

  // DEBUG
  // bot.on('message', (ctx, next) => {
  //   console.log(ctx.message);
  //   next();
  // });

  registerOnStartHandler(bot);
  registerOnCreateMeetingHandler(bot);
  registerOnGetActiveEventsHandler(bot);
  registerOnDeleteEventHandler(bot);
  registerOnGetEventsHandler(bot);

  const logger = inject(loggerInjectionToken);
  logger.info(['Transport Telegram', 'provider'], 'Bot is started!');
};
