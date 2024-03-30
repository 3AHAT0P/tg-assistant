import { CommandContext, Context } from 'grammy';

import { inject } from '#lib/DI';
import { isNullOrUndefined } from '#utils';
import { onlineMeetingStoreInjectionToken, transformToTGMarkdownMessage } from '#module/store/OnlineMeetingRecord';

import { TGBot } from '../@types';

export const registerOnDeleteEventHandler = (bot: TGBot): void => {
  bot.command('delete_event', onDeleteEvent);
};

const onDeleteEvent = async (context: CommandContext<Context>) => {
  if (context.from?.id?.toString() !== '402048357') return;
  const onlineRecordsStore = inject(onlineMeetingStoreInjectionToken);

  const id = context.message?.text.split(' ')[1];

  if (isNullOrUndefined(id)) {
    context.reply('Невалидный id события!');
    return;
  }

  const record = await onlineRecordsStore.getRecordById(id);

  if (record === null) {
    context.reply('Невалидный id события!');
    return;
  }

  await onlineRecordsStore.deleteRecordById(id);

  context.reply(
    `Следующие событие было удалено:\n${transformToTGMarkdownMessage(record)}`,
    { parse_mode: 'MarkdownV2' },
  );
};
