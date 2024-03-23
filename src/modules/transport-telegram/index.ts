import { inject } from '#lib/DI';
import type { OnlineMeetingRecord } from '#module/store/@types/OnlineMeetingRecord';
import { DateTime, Duration } from 'luxon';

import { tgBotInjectionToken, provider } from './provider';

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

// @TODO(ikos): Zone and locale move to user settings
const userZone = 'Europe/Moscow';
const userLocale = 'ru-RU';

// @TODO(ikos): Возможно нужно перенести в другое место
export const notifyUserAboutMeeting = async (data: NotifyUserAboutMeetingData) => {
  const deltaTimeText = Duration
    .fromObject({ minutes: Math.round(data.deltaTime.as('minutes')) }, { locale: userLocale })
    .toHuman();

  const timeString = data.plannedDate.setZone(userZone).toFormat('HH:mm', { locale: userLocale });
  await sendMarkdownToUser(
    data.userId,
    `Созвон через ${deltaTimeText} в ${timeString}\\.\n[${data.name}](${data.link})`
  );
};

export {
  tgBotInjectionToken,
  provider,
};
