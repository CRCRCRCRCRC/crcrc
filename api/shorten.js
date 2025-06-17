import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
const dbName = process.env.DB_NAME || "shortener";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { url, customCode } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "無效網址" });
  }

  const code = (customCode || Math.random().toString(36).slice(2, 8)).trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    return res.status(400).json({ error: "短碼只能包含英數字、- 或 _" });
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const urls = db.collection("urls");

    const exists = await urls.findOne({ code });
    if (exists) return res.status(409).json({ error: "這個短碼已經被使用了" });

    await urls.insertOne({ code, url });
    const baseUrl = req.headers.origin || `https://${req.headers.host}`;
    res.status(200).json({ shortUrl: `${baseUrl}/${code}` });
  } catch (err) {
    res.status(500).json({ error: "伺服器錯誤" });
  }
}
