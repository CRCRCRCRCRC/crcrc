import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
const dbName = process.env.DB_NAME || "shortener";

export default async function handler(req, res) {
  const { code } = req.query;

  try {
    await client.connect();
    const db = client.db(dbName);
    const urls = db.collection("urls");

    const entry = await urls.findOne({ code });
    if (!entry) return res.status(404).send("短網址不存在");

    res.writeHead(302, { Location: entry.url });
    res.end();
  } catch {
    res.status(500).send("伺服器錯誤");
  }
}
