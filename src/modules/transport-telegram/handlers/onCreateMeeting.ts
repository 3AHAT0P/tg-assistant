import { CommandContext, Context } from 'grammy';
import { DateTime } from 'luxon';

import { inject } from '#lib/DI';
import {
  type OnlineMeetingRecord,
  onlineMeetingStoreInjectionToken,
  buildOnlineMeetingRecord,
} from '#module/store/OnlineMeetingRecord';
import {
  isHours, isMinutes, isMonthDayIndex, isMonthIndex, isNullOrUndefined, isWeekDayIndex, isWeekIndex,
  tryToNumberOrDefault, validateNumberOrDefault,
} from '#utils';

import type { TGBot } from '../@types';

export const registerOnCreateMeetingHandler = (bot: TGBot): void => {
  bot.command('create_event', onCreateMeeting);
};

const validateRepeat = (value: string | null): value is OnlineMeetingRecord['repeat'] => {
  if (value === null) return true;
  return ['workdays', 'weekly', 'monthly'].includes(value);
};

const regexpDate = /y?(\d{4})?M?(\d{1,2})?d?(\d{1,2})?h?(\d{1,2})?m?(\d{1,2})?/;
const regexpWeek = /y?(\d{4})?w?(\d{1,2})?d?(\d{1,2})?h?(\d{1,2})?m?(\d{1,2})?/;

const eventMessageParser = (message: string) => {
  const result: Partial<OnlineMeetingRecord> = {};
  const lines = message.split('\n');
  for (const line of lines) {
    const [key, value, ...other] = line.split(':').map((part) => part.trim());
    if (isNullOrUndefined(key) || isNullOrUndefined(value)) continue;

    switch (key) {
      case 'name':
        result.name = value;
        break;

      case 'link':
        result.link = [value, ...other].join(':');
        break;

      case 'repeat':
        if (validateRepeat(value)) {
          result.repeat = value;
        } else result.repeat = null;
        break;

      case 'date': {
        const currentDate = DateTime.now();
        const [,
          yearString = '',
          monthString = '',
          dayString = '',
          hourString = '',
          minuteString = ''
        ] = value.match(regexpDate) ?? [];

        result.schedule = {
          date: {
            year: tryToNumberOrDefault(yearString, currentDate.year),
            month: validateNumberOrDefault(monthString, isMonthIndex, currentDate.month),
            day: validateNumberOrDefault(dayString, isMonthDayIndex, currentDate.day),
            hour: validateNumberOrDefault(hourString, isHours, currentDate.hour),
            minute: validateNumberOrDefault(minuteString, isMinutes, currentDate.minute),
          },
        };

        break;
      }
      case 'week': {
        const currentDate = DateTime.now();
        const [,
          yearString = '',
          weekString = '',
          dayString = '',
          hourString = '',
          minuteString = ''
        ] = value.match(regexpWeek) ?? [];

        result.schedule = {
          week: {
            year: tryToNumberOrDefault(yearString, currentDate.year),
            weekNumber: validateNumberOrDefault(weekString, isWeekIndex, currentDate.weekNumber),
            day: validateNumberOrDefault(dayString, isWeekDayIndex, currentDate.weekday),
            hour: validateNumberOrDefault(hourString, isHours, currentDate.hour),
            minute: validateNumberOrDefault(minuteString, isMinutes, 0),
          },
        };
        break;
      }
      default:
        break;
    }
  }
  return result as Pick<OnlineMeetingRecord, 'name' | 'link' | 'schedule' | 'repeat'>;
};

const onCreateMeeting = async (context: CommandContext<Context>) => {
  if (context.from?.id?.toString() !== '402048357') return;

  const store = inject(onlineMeetingStoreInjectionToken);

  const text = context.message?.text ?? null;
  if (text === null) {
    context.reply('Incorrect message.');
    return;
  }

  const data: Partial<OnlineMeetingRecord> = eventMessageParser(text);

  if (isNullOrUndefined(context.from)) {
    context.reply('Incorrect message.');
    return;
  }
  data.userId = context.from.id.toString();

  if (
    isNullOrUndefined(data.name)
    || isNullOrUndefined(data.link)
    || isNullOrUndefined(data.schedule)
  ) {
    context.reply('Incorrect message.');
    return;
  }

  const record = buildOnlineMeetingRecord(data as Omit<OnlineMeetingRecord, 'id' | 'createdAt' | 'updatedAt'>);

  await store.saveRecordById(record.id, record);
};
