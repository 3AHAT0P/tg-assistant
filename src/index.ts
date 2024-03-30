import { Settings } from 'luxon';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';

import { isNullOrUndefined } from '#utils';

import { initProviders } from './providers';

const main = async (): Promise<void> => {

  Settings.defaultZone = 'utc';

  await initProviders();

  console.log('Bot is started!');

  // proxy
  const requestHandler = async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    const parts = req.url?.split('/') ?? [];
    if (parts[1] === 'zoom' && parts[2] === 'join' && !isNullOrUndefined(parts[3])) {
      res.writeHead(307, {
        'Location': `zoommtg://veon.zoom.us/join?action=join&confno=${parts[3]}`,
      });
    } else res.writeHead(404);
    res.end();
  };

  const server = createServer(requestHandler);

  server.listen(3001);
  console.log('Server is started!');

};

main();
