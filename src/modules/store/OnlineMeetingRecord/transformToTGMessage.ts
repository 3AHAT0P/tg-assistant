import { inject } from '#lib/DI';
import { sanitazeTGMessage } from '#module/transport-telegram/utils/sanitazeTGMessage';
import { configInjectionToken } from '#module/config';

import { getDateFromRecord } from './getDateFromRecord';
import { OnlineMeetingRecord } from './@types/OnlineMeetingRecord';

const repeatMap = <const>{
  workdays: 'По будням',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
};

export const transformToTGMarkdownMessage = (record: OnlineMeetingRecord): string => {
  const config = inject(configInjectionToken);
  const date = getDateFromRecord(record).setZone(config.defaultTimezone);
  let text = sanitazeTGMessage(`ID: ${record.id}\n`)
    + `[${sanitazeTGMessage(record.name)}](${record.link})\n`
    + `С ${sanitazeTGMessage(date.toFormat('dd-MM-yyyy HH:mm \'(GMT+3)\''))}`;
  if (record.repeat === null) text += '\n';
  else text += ` ${repeatMap[record.repeat]}\n`;

  return text;
};
