import { CommandContext } from 'grammy';
import { DateTime } from 'luxon';

import { inject } from '#lib/DI';
import { configInjectionToken } from '#module/config';
import { EventRepositoryInjectionToken, transformToTGMarkdownMessage } from '#module/store/PostgresStorage/EventModel';
import { UserNotFoundError } from '#utils/errors/UserNotFoundError';

import { TGBot, TGBotContext } from '../@types';
import { getAuthorizedUserMiddleware } from '../middlewares/getAuthorizedUserMiddleware';


export const registerOnGetEventsHandler = (bot: TGBot): void => {
  bot.command('get_events', onGetEvents);
};

const onGetEvents = async (context: CommandContext<TGBotContext>) => {
  const user = await getAuthorizedUserMiddleware(context);
  if (user instanceof UserNotFoundError) {
    context.reply('Unauthorized.');
    return;
  }

  const text = context.message?.text ?? null;
  if (text === null) {
    context.reply('Incorrect message.');
    return;
  }

  const eventRepository = inject(EventRepositoryInjectionToken);

  const range = text.split(' ')[1] ?? 'day';

  const result = [];

  let dateRange: [Date, Date];

  switch (range) {
    case 'day':
      dateRange = [DateTime.now().startOf('day').toJSDate(), DateTime.now().endOf('day').toJSDate()];
      break;
    case 'week':
      dateRange = [DateTime.now().startOf('week').toJSDate(), DateTime.now().endOf('week').toJSDate()];
      break;
    case 'month':
      dateRange = [DateTime.now().startOf('month').toJSDate(), DateTime.now().endOf('month').toJSDate()];
      break;
    default: {
      context.reply('Incorrect message.');
      return;
    }
  }

  const config = inject(configInjectionToken);

  for (const record of await eventRepository.getAll({ userId: user.id, startAt: dateRange })) {
    result.push(transformToTGMarkdownMessage(record, user.timezone ?? config.defaultTimezone));
  }
  if (result.length === 0) {
    context.reply('List is Empty!');
    return;
  }
  context.reply(result.join(`\n${'\\-'.repeat(9)}\n`), { parse_mode: 'MarkdownV2' });
};
