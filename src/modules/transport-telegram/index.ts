import { DateTime, Duration } from 'luxon';

import { inject } from '#lib/DI';
import type { EventModel } from '#module/store/PostgresStorage/EventModel/@types';

import { tgBotInjectionToken, provider } from './provider';
import { sanitazeTGMessage } from './utils/sanitazeTGMessage';

type NotifyUserAboutMeetingData = Pick<EventModel, 'name' | 'link' | 'userId'> & {
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
export const notifyUserAboutMeeting = async (
  data: NotifyUserAboutMeetingData,
  options: { timezone: string; locale: string },
) => {
  const deltaTimeText = Duration
    .fromObject({ minutes: Math.round(data.deltaTime.as('minutes')) }, { locale: options.locale })
    .toHuman();

  const timeString = data.plannedDate
    .setZone(options.timezone)
    .toFormat('HH:mm', { locale: options.locale });

  await sendMarkdownToUser(
    data.userId,
    `Созвон через ${sanitazeTGMessage(deltaTimeText)} в ${timeString}\\.\n[${sanitazeTGMessage(data.name)}](${data.link})`
  );
};

export {
  tgBotInjectionToken,
  provider,
};
