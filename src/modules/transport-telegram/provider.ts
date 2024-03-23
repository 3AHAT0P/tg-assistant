import { Bot } from 'grammy';

import { InjectionToken, inject, provide } from '#lib/DI';
import { configInjectionToken } from '#module/config';

import type { TGBot } from './@types';
import { registerOnStartHandler } from './handlers/onStart';
import { registerOnCreateMeetingHandler } from './handlers/onCreateMeeting';
import { registerOnGetActiveEventsHandler } from './handlers/onGetActiveEvents';

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

  registerOnStartHandler(bot);
  registerOnCreateMeetingHandler(bot);
  registerOnGetActiveEventsHandler(bot);
};
