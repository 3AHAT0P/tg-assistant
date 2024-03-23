import { DateTime } from 'luxon';

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
