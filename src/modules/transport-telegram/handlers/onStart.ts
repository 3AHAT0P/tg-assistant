import { CommandContext, Context } from 'grammy';

import { getRandomInt, isNullOrUndefined } from '#utils';

import { TGBot } from '../@types';
import { UserRepositoryInjectionToken } from '#module/store/PostgresStorage/UserModel';
import { inject } from '#lib/DI';
import { configInjectionToken } from '#module/config';

export const registerOnStartHandler = (bot: TGBot): void => {
  bot.command('start', onStart);
};

const greetingStickers = <const>[
  'CAACAgIAAxkBAAMHZewWBd9IVyJkq2R3pMTNOSD8hf0AAkIQAAIzxSlJkA7UEacqSoI0BA',
  'CAACAgIAAxkBAAIBBmYaT6-Zj_-Az-xGdqzNiCY5M5mkAAKODwACDcYISmuAWaIXCOSXNAQ',
  'CAACAgIAAxkBAAIBEmYaUHszkIxLNli2NdvhW3AY6KpeAAIFAAPANk8T-WpfmoJrTXU0BA',
  'CAACAgIAAxkBAAIBFGYaULFr7N2yX8x2oh01-OGFD3bdAAJWAgACusCVBRWh9E5lx-1kNAQ',
];


const onStart = async (context: CommandContext<Context>) => {
  const from = context.from;
  if (isNullOrUndefined(from)) return;

  const userRepository = inject(UserRepositoryInjectionToken);
  const user = await userRepository.findByTGId({tgId: from.id.toString()});

  if (user !== null) {
    if (user.isEnabled) {
      const index = getRandomInt(0, greetingStickers.length);
      context.replyWithSticker(greetingStickers[index] ?? greetingStickers[0]);
      return;
    }
    context.reply('Вы уже успешно зарегестрированы. Ожидайте подтверждения администратора.');
    return;
  }

  const config = inject(configInjectionToken);
  await userRepository.createOne({
    firstName: from.first_name,
    lastName: from.last_name ?? '',
    tgId: from.id.toString(),
    locale: config.defaultLocale,
    timezone: config.defaultTimezone,
    isEnabled: false,
  });
  context.reply('Вы уже успешно зарегестрированы. Ожидайте подтверждения администратора.');
};
