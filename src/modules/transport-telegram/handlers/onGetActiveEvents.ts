import { CommandContext, Context } from 'grammy';

import { inject } from '#lib/DI';
import { onlineMeetingStoreInjectionToken, getDateFromRecord } from '#module/store/OnlineMeetingRecord';

import { TGBot } from '../@types';

// @TODO(ikos): Zone and locale move to user settings
const userZone = 'Europe/Moscow';
const userLocale = 'ru-RU';

const repeatMap = <const>{
  workdays: 'По будням',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
};

export const registerOnGetActiveEventsHandler = (bot: TGBot): void => {
  bot.command('get_active_events', onGetActiveEvents);
};

const onGetActiveEvents = async (context: CommandContext<Context>) => {
  const onlineRecordsStore = inject(onlineMeetingStoreInjectionToken);

  const result = [];

  for (const record of await onlineRecordsStore.getAllRecords()) {
    const date = getDateFromRecord(record).setZone(userZone);
    let text = `[${record.name}](${record.link})\n`
      + `С ${date.toFormat('dd\\-MM\\-yyyy HH:mm \'\\(GMT\\+3\\)\'')}`;
    if (record.repeat === null) text += '\n';
    else text += ` ${repeatMap[record.repeat]}\n`;
    result.push(text);
  }

  context.reply(result.join(`\n${'\\-'.repeat(9)}\n`), { parse_mode: 'MarkdownV2' });
};
