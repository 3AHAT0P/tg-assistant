import { CommandContext } from 'grammy';
import { DateTime } from 'luxon';

import { inject } from '#lib/DI';
import {
  isHours, isMinutes, isMonthDayIndex, isMonthIndex, isNullOrUndefined, isWeekDayIndex, isWeekIndex,
  tryToNumberOrDefault, validateNumberOrDefault,
} from '#utils';
import { UserNotFoundError } from '#utils/errors';

import { configInjectionToken } from '#module/config';
import { EventRepositoryInjectionToken } from '#module/store/PostgresStorage/EventModel';

import type { TGBot, TGBotContext } from '../@types';
import { getAuthorizedUserMiddleware } from '../middlewares';

export const registerOnCreateMeetingHandler = (bot: TGBot): void => {
  bot.command('create_event', onCreateMeeting);
};

const validateRepeat = (value: string | null): value is 'workdays' | 'weekly' | 'monthly' | null => {
  if (value === null) return true;
  return ['workdays', 'weekly', 'monthly'].includes(value);
};

const regexpDate = /y?(\d{4})?M?(\d{1,2})?d?(\d{1,2})?h?(\d{1,2})?m?(\d{1,2})?/;
const regexpWeek = /y?(\d{4})?w?(\d{1,2})?d?(\d{1,2})?h?(\d{1,2})?m?(\d{1,2})?/;

const eventMessageParser = (message: string, timezone: string) => {
  const result: {
    name: string | null;
    link: string | null;
    repeat: 'workdays' | 'weekly'| 'monthly' | null;
    startAt: Date | null;
  } = {
    name: null,
    link: null,
    repeat: null,
    startAt: null,
  };
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

        currentDate = currentDate.set({
          year: tryToNumberOrDefault(yearString, currentDate.year),
          month: validateNumberOrDefault(monthString, isMonthIndex, currentDate.month),
          day: validateNumberOrDefault(dayString, isMonthDayIndex, currentDate.day),
          hour: validateNumberOrDefault(hourString, isHours, currentDate.hour),
          minute: validateNumberOrDefault(minuteString, isMinutes, 0),
        });
        result.startAt = currentDate.toJSDate();

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

        currentDate = currentDate.set({
          weekYear: tryToNumberOrDefault(yearString, currentDate.year),
          weekNumber: validateNumberOrDefault(weekString, isWeekIndex, currentDate.weekNumber),
          weekday: validateNumberOrDefault(dayString, isWeekDayIndex, currentDate.weekday),
          hour: validateNumberOrDefault(hourString, isHours, currentDate.hour),
          minute: validateNumberOrDefault(minuteString, isMinutes, 0),
        });
        result.startAt = currentDate.toJSDate();
        break;
      }
      default:
        break;
    }
  }
  return result;
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
  const data = eventMessageParser(text, user.timezone ?? config.defaultTimezone);

  if (
    isNullOrUndefined(data.name)
    || isNullOrUndefined(data.link)
    || isNullOrUndefined(data.startAt)
  ) {
    context.reply('Incorrect message.');
    return;
  }

  if (data.link.includes('zoom.us/j/')) {
    const result = data.link.match(/zoom\.us\/j\/(?<roomId>\d+).*(pwd=(?<password>[\w\d]+))/);
    const roomId = result?.groups?.['roomId'] ?? '';
    const password = result?.groups?.['password'] ?? '';
    if (roomId !== '') {
      data.link = config.self.publicHost;
      if (config.self.publicPort !== null) data.link += `:${config.self.publicPort}`;
      data.link += `/zoom/join/${roomId}`;

      if (password !== '') data.link += `?pwd=${password}`;
    }
  }

  const eventRepository = inject(EventRepositoryInjectionToken);

  try {
    const event = await eventRepository.createOne({
      name: data.name,
      link: data.link,
      startAt: data.startAt,
      repeat: data.repeat,
      userId: user.id,
    });

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
