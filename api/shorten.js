import { nanoid } from 'nanoid';

const urlMap = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支援 POST 請求' });
  }

  const { url, customCode } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: '無效網址' });
  }

  const code = (customCode || nanoid(6)).trim();

  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    return res.status(400).json({ error: '短碼只能包含英數字、- 或 _' });
  }

  if (urlMap[code]) {
    return res.status(409).json({ error: '短碼已被使用' });
  }

  urlMap[code] = url;

  const baseUrl = `https://${req.headers.host}`;
  return res.status(200).json({ shortUrl: `${baseUrl}/api/r/${code}` });
}

export { urlMap };
