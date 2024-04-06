import { DateTime } from 'luxon';

import { ScheduleDateRecord, ScheduleWeekDayRecord } from '../@types/ScheduleRecord';

import { OnlineMeetingRecord } from './@types/OnlineMeetingRecord';

export const getDateFromRecord = (record: OnlineMeetingRecord): DateTime => {
  if ('date' in record.schedule) {
    const { year, month, day, hour, minute } = record.schedule.date;

    return DateTime.fromObject({
      year, month, day, hour, minute,
      second: 0,
      millisecond: 0,
    });
  } else {
    const { year, weekNumber, day: weekday, hour, minute } = record.schedule.week;

    return DateTime.fromObject({
      weekYear: year,
      weekNumber,
      weekday,
      hour,
      minute,
      second: 0,
      millisecond: 0,
    });
  }
};

export const getDateFromSchedule = <
  TSchedule extends ScheduleWeekDayRecord | ScheduleDateRecord
>(schedule: TSchedule, timezone: string): DateTime => {
  if ('date' in schedule) {
    const { year, month, day, hour, minute } = schedule.date;

    return DateTime.fromObject({
      year, month, day, hour, minute,
      second: 0,
      millisecond: 0,
    }, { zone: timezone });
  } else {
    const { year, weekNumber, day: weekday, hour, minute } = schedule.week;

    return DateTime.fromObject({
      weekYear: year,
      weekNumber,
      weekday,
      hour,
      minute,
      second: 0,
      millisecond: 0,
    }, { zone: timezone });
  }
};
