import { CommandContext, Context } from 'grammy';

import { TupleIndices } from '#utils/@types';

import { TGBot } from '../@types';

export const registerOnStartHandler = (bot: TGBot): void => {
  bot.command('start', onStart);
};

const greetingStickers = <const>[
  'CAACAgIAAxkBAAMHZewWBd9IVyJkq2R3pMTNOSD8hf0AAkIQAAIzxSlJkA7UEacqSoI0BA',
];

const onStart = (context: CommandContext<Context>) => {
  console.log('Bot take start command', context.from);
  const index: TupleIndices<typeof greetingStickers> = 0;
  context.replyWithSticker(greetingStickers[index]);
};
