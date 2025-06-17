import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./data.json');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url, customCode } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: '無效網址' });
  }

  const code = (customCode || Math.random().toString(36).substr(2, 6)).trim();

  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    return res.status(400).json({ error: '短碼只能包含英數字、- 或 _' });
  }

  const db = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (db[code]) {
    return res.status(409).json({ error: '這個短碼已經被使用了' });
  }

  db[code] = url;
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));

  res.status(200).json({ shortUrl: `${req.headers.origin}/${code}` });
}

// api/r/[code].js
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./data.json');

export default async function handler(req, res) {
  const { code } = req.query;
  const db = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (db[code]) {
    res.writeHead(302, { Location: db[code] });
    res.end();
  } else {
    res.status(404).send("短網址不存在");
  }
}
