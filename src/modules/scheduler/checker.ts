import { DateTime } from 'luxon';

import { inject } from '#lib/DI';
import { loggerInjectionToken } from '#module/logger';
import { configInjectionToken } from '#module/config';
import { notifyUserAboutMeeting } from '#module/transport-telegram';
import { EventRepositoryInjectionToken } from '#module/store/PostgresStorage/EventModel';
import { UserRepositoryInjectionToken } from '#module/store/PostgresStorage/UserModel';

// функция гопник
export const checker = async (): Promise<void> => {
  const eventRepository = inject(EventRepositoryInjectionToken);
  const userRepository = inject(UserRepositoryInjectionToken);
  const config = inject(configInjectionToken);

  const records = await eventRepository.getCloseToTime({
    datetime: new Date(),
    range: [-60, Math.trunc(config.scheduleRunDelay * 2 / 1000)],
  });

  const logger = inject(loggerInjectionToken);

  logger.info(['Scheduler', 'checker'], `Found ${records.length} records.`);

  for (const record of records) {
    const plannedDate: DateTime = DateTime.fromJSDate(record.startAt);

    const deltaTime = plannedDate.diffNow(['milliseconds']);
    const deltaTimeAsMilliseconds = deltaTime.as('milliseconds');

    const user = await userRepository.findById({id: record.userId});

    if (user === null) continue;

    if (deltaTimeAsMilliseconds >= 0 && deltaTimeAsMilliseconds <= config.scheduleRunDelay * 2) {
      await notifyUserAboutMeeting({
        name: record.name,
        link: record.link,
        userId: user.tgId,
        deltaTime,
        plannedDate,
      }, {
        timezone: user.timezone ?? config.defaultTimezone,
        locale: user.locale ?? config.defaultLocale,
      });
    }
  }
};
