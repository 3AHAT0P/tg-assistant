import { CommandContext } from 'grammy';
import { DateTime } from 'luxon';

import { inject } from '#lib/DI';
import {
  type OnlineMeetingRecord,
  getDateFromSchedule,
} from '#module/store/OnlineMeetingRecord';
import {
  isHours, isMinutes, isMonthDayIndex, isMonthIndex, isNullOrUndefined, isWeekDayIndex, isWeekIndex,
  tryToNumberOrDefault, validateNumberOrDefault,
} from '#utils';
import { UserNotFoundError } from '#utils/errors';

import { EventRepositoryInjectionToken } from '#module/store/PostgresStorage/EventModel';

import type { TGBot, TGBotContext } from '../@types';
import { getAuthorizedUserMiddleware } from '../middlewares';
import { configInjectionToken } from '#module/config';

export const registerOnCreateMeetingHandler = (bot: TGBot): void => {
  bot.command('create_event', onCreateMeeting);
};

const validateRepeat = (value: string | null): value is OnlineMeetingRecord['repeat'] => {
  if (value === null) return true;
  return ['workdays', 'weekly', 'monthly'].includes(value);
};

const regexpDate = /y?(\d{4})?M?(\d{1,2})?d?(\d{1,2})?h?(\d{1,2})?m?(\d{1,2})?/;
const regexpWeek = /y?(\d{4})?w?(\d{1,2})?d?(\d{1,2})?h?(\d{1,2})?m?(\d{1,2})?/;

const eventMessageParser = (message: string, timezone: string) => {
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
        let currentDate = DateTime.now().setZone(timezone);
        if (!currentDate.isValid) currentDate = DateTime.now();
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
        let currentDate = DateTime.now().setZone(timezone);
        if (!currentDate.isValid) currentDate = DateTime.now();
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

const onCreateMeeting = async (context: CommandContext<TGBotContext>) => {
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

  const config = inject(configInjectionToken);
  const data = eventMessageParser(text, config.defaultTimezone);

  if (
    isNullOrUndefined(data.name)
    || isNullOrUndefined(data.link)
    || isNullOrUndefined(data.schedule)
  ) {
    context.reply('Incorrect message.');
    return;
  }

  const eventRepository = inject(EventRepositoryInjectionToken);

  try {
    const event = await eventRepository.createOne({
      name: data.name,
      link: data.link,
      startAt: getDateFromSchedule(data.schedule, config.defaultTimezone).toJSDate(),
      repeat: data.repeat,
      userId: user.id,
    });

    console.log('event', event);

    if (event === null) {
      context.reply('Error!');
      return;
    }

    switch (event.repeat) {
      case 'workdays': {
        const promises = [];
        for (let index = 1; index <= 30; ++index) {
          const date = DateTime.fromJSDate(event.startAt).plus({ day: index });
          if (date.weekday > 5) continue;
          promises.push(eventRepository.createOne({
            name: event.name,
            link: event.link,
            startAt: date.toJSDate(),
            repeat: event.repeat,
            userId: user.id,
          }));
        }
        await Promise.all(promises);
        break;
      }
      case 'weekly': {
        const promises = [];
        for (let index = 1; index <= 4; ++index) {
          promises.push(eventRepository.createOne({
            name: event.name,
            link: event.link,
            startAt: DateTime.fromJSDate(event.startAt).plus({ week: index }).toJSDate(),
            repeat: event.repeat,
            userId: user.id,
          }));
        }
        await Promise.all(promises);
        break;
      }
      case 'monthly': {
        await eventRepository.createOne({
          name: event.name,
          link: event.link,
          startAt: DateTime.fromJSDate(event.startAt).plus({ month: 1 }).toJSDate(),
          repeat: event.repeat,
          userId: user.id,
        });
        break;
      }
    }
  } catch (error) {
    console.error('onCreateMeeting', error);
  }
};
