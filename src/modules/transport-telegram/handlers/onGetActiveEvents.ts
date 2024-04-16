import { CommandContext } from 'grammy';

import { inject } from '#lib/DI';
import { configInjectionToken } from '#module/config';
import { EventRepositoryInjectionToken, transformToTGMarkdownMessage } from '#module/store/PostgresStorage/EventModel';
import { UserNotFoundError } from '#utils/errors/UserNotFoundError';

import { TGBot, TGBotContext } from '../@types';
import { getAuthorizedUserMiddleware } from '../middlewares/getAuthorizedUserMiddleware';


export const registerOnGetActiveEventsHandler = (bot: TGBot): void => {
  bot.command('get_active_events', onGetActiveEvents);
};

const onGetActiveEvents = async (context: CommandContext<TGBotContext>) => {
  const user = await getAuthorizedUserMiddleware(context);
  if (user instanceof UserNotFoundError) {
    context.reply('Unauthorized.');
    return;
  }

  const eventRepository = inject(EventRepositoryInjectionToken);
  const result = [];

  const config = inject(configInjectionToken);

  for (const record of await eventRepository.getAll({ userId: user.id, startAt: new Date() })) {
    result.push(transformToTGMarkdownMessage(record, user.timezone ?? config.defaultTimezone));
  }

  context.reply(result.join(`\n${'\\-'.repeat(9)}\n`), { parse_mode: 'MarkdownV2' });
};
