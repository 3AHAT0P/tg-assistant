import { CommandContext } from 'grammy';

import { inject } from '#lib/DI';
import { isNullOrUndefined } from '#utils';
import { UserNotFoundError } from '#utils/errors';
import { EventRepositoryInjectionToken, transformToTGMarkdownMessage } from '#module/store/PostgresStorage/EventModel';

import { TGBot, TGBotContext } from '../@types';
import { getAuthorizedUserMiddleware } from '../middlewares';

export const registerOnDeleteEventHandler = (bot: TGBot): void => {
  bot.command('delete_event', onDeleteEvent);
};

const onDeleteEvent = async (context: CommandContext<TGBotContext>) => {
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

  const id = text.split(' ')[1];

  if (isNullOrUndefined(id)) {
    context.reply('Невалидный id события!');
    return;
  }

  const record = await eventRepository.deleteById(id);

  if (record === null) {
    context.reply('Невалидный id события!');
    return;
  }

  context.reply(
    `Следующие событие было удалено:\n${transformToTGMarkdownMessage(record)}`,
    { parse_mode: 'MarkdownV2' },
  );
};

