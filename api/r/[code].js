import { urlMap } from '../shorten.js';

export default async function handler(req, res) {
  const { code } = req.query;
  const url = urlMap[code];

  if (url) {
    res.writeHead(302, { Location: url });
    res.end();
  } else {
    res.status(404).send('短網址不存在');
  }
}
