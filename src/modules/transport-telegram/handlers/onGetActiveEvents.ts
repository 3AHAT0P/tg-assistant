import { CommandContext, Context } from 'grammy';

import { inject } from '#lib/DI';
import { onlineMeetingStoreInjectionToken, transformToTGMarkdownMessage } from '#module/store/OnlineMeetingRecord';

import { TGBot } from '../@types';

export const registerOnGetActiveEventsHandler = (bot: TGBot): void => {
  bot.command('get_active_events', onGetActiveEvents);
};

const onGetActiveEvents = async (context: CommandContext<Context>) => {
  if (context.from?.id?.toString() !== '402048357') return;
  const onlineRecordsStore = inject(onlineMeetingStoreInjectionToken);

  const result = [];

  for (const record of await onlineRecordsStore.getAllRecords()) {
    result.push(transformToTGMarkdownMessage(record));
  }

  context.reply(result.join(`\n${'\\-'.repeat(9)}\n`), { parse_mode: 'MarkdownV2' });
};
