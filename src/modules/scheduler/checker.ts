import { DateTime } from 'luxon';

import { inject } from '#lib/DI';
import { configInjectionToken } from '#module/config';
import { onlineMeetingStoreInjectionToken } from '#module/store/onlineMeetingStoreProvider';
import { notifyUserAboutMeeting } from '#module/transport-telegram';


// функция гопник
export const checker = async (): Promise<void> => {
  const onlineMeetingStore = inject(onlineMeetingStoreInjectionToken);
  const config = inject(configInjectionToken);

  for (const record of await onlineMeetingStore.getAllRecords()) {
    let plannedDate!: DateTime;

    if ('date' in record.schedule) {
      const { year, month, day, hour, minute } = record.schedule.date;

      plannedDate = DateTime.fromObject({
        year, month, day, hour, minute,
        second: 0,
        millisecond: 0,
      });
    } else {
      const { year, weekNumber, day: weekday, hour, minute } = record.schedule.week;

      plannedDate = DateTime.fromObject({
        weekYear: year,
        weekNumber,
        weekday,
        hour,
        minute,
        second: 0,
        millisecond: 0,
      });
    }

    let deltaTime = plannedDate.diffNow(['milliseconds']);
    let deltaTimeAsMilliseconds = deltaTime.as('milliseconds');

    if (deltaTimeAsMilliseconds < 0 && record.repeat !== null) {
      const currentDate = DateTime.now();
      switch (record.repeat) {
        case 'workdays': {
          if (currentDate.weekday <= 5) {
            plannedDate = plannedDate.set({ day: currentDate.day });
          }
          break;
        }
        case 'weekly': {
          if (currentDate.weekday === plannedDate.weekday) {
            plannedDate = plannedDate.set({ weekNumber: currentDate.weekNumber });
          }
          break;
        }
        case 'monthly': {
          if (currentDate.day === plannedDate.day) {
            plannedDate = plannedDate.set({ month: currentDate.month });
          }
          break;
        }
      }

      deltaTime = plannedDate.diffNow(['milliseconds']);
      deltaTimeAsMilliseconds = deltaTime.as('milliseconds');
    }

    if (deltaTimeAsMilliseconds >= 0 && deltaTimeAsMilliseconds <= config.scheduleRunDelay * 2) {
      await notifyUserAboutMeeting({
        name: record.name,
        link: record.link,
        userId: record.userId,
        deltaTime,
        plannedDate,
      });
    } 
  }
};
