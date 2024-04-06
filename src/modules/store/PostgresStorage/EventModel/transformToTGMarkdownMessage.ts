import { DateTime } from 'luxon';

import { inject } from '#lib/DI';
import { sanitazeTGMessage } from '#module/transport-telegram/utils/sanitazeTGMessage';
import { configInjectionToken } from '#module/config';

import { EventModel } from './@types';

const repeatMap = <const>{
  workdays: 'По будням',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
};

export const transformToTGMarkdownMessage = (record: EventModel): string => {
  const config = inject(configInjectionToken);

  const date = DateTime.fromJSDate(record.startAt).setZone(config.defaultTimezone);
  let text = sanitazeTGMessage(`ID: ${record.id}\n`)
    + `[${sanitazeTGMessage(record.name)}](${record.link})\n`
    + `С ${sanitazeTGMessage(date.toFormat('dd-MM-yyyy HH:mm \'(GMT+3)\''))}`;
  if (record.repeat === null) text += '\n';
  else text += ` ${repeatMap[record.repeat]}\n`;

  return text;
};
