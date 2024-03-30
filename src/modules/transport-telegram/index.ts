import { inject } from '#lib/DI';
import type { OnlineMeetingRecord } from '#module/store/OnlineMeetingRecord';
import { DateTime, Duration } from 'luxon';

import { tgBotInjectionToken, provider } from './provider';
import { configInjectionToken } from '#module/config';
import { sanitazeTGMessage } from './utils/sanitazeTGMessage';

type NotifyUserAboutMeetingData = Pick<OnlineMeetingRecord, 'name' | 'link' | 'userId'> & {
  deltaTime: Duration;
  plannedDate: DateTime;
};

export const sendMarkdownToUser = async (userChatId: string, message: string): Promise<void> => {
  const bot = inject(tgBotInjectionToken);
  await bot.api.sendMessage(
    userChatId,
    message,
    { parse_mode: 'MarkdownV2' },
  );
};

// @TODO(ikos): Возможно нужно перенести в другое место
export const notifyUserAboutMeeting = async (data: NotifyUserAboutMeetingData) => {
  const config = inject(configInjectionToken);
  const deltaTimeText = Duration
    .fromObject({ minutes: Math.round(data.deltaTime.as('minutes')) }, { locale: config.defaultLocale })
    .toHuman();

  const timeString = data.plannedDate
    .setZone(config.defaultTimezone)
    .toFormat('HH:mm', { locale: config.defaultLocale });

  await sendMarkdownToUser(
    data.userId,
    `Созвон через ${sanitazeTGMessage(deltaTimeText)} в ${timeString}\\.\n[${sanitazeTGMessage(data.name)}](${data.link})`
  );
};

export {
  tgBotInjectionToken,
  provider,
};
