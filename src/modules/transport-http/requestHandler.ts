import { IncomingMessage, ServerResponse } from 'node:http';

import { isNullOrUndefined } from '#utils';

export const requestHandler = async (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
  const [uri, queryString] = req.url?.split('?') ?? [];
  if (isNullOrUndefined(uri)) {
    res.writeHead(404);
    res.end();
    return;
  }

  const parts = uri.split('/');
  if (parts[1] === 'zoom' && parts[2] === 'join' && !isNullOrUndefined(parts[3])) {
    let resultURL = `zoommtg://veon.zoom.us/join?action=join&confno=${parts[3]}`;
    if (!isNullOrUndefined(queryString)) resultURL += `&${queryString}`;
    res.writeHead(307, {
      'Location': resultURL,
    });
  } else res.writeHead(404);
  res.end();
};
