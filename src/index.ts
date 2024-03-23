import { DateTime, Settings } from 'luxon';

import { initProviders } from './providers';

const main = async (): Promise<void> => {

  Settings.defaultZone = 'utc';

  await initProviders();

  // // bot.on('message:text', ctx => ctx.reply(ctx.message.text));
  // // bot.on('message', ctx => console.log(ctx.message.sticker));

  console.log('Bot is started!');
};

main();
