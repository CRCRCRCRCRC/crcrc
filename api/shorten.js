import { MongoClient } from 'mongodb';
import { customAlphabet } from 'nanoid';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, custom } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing URL' });

    await client.connect();
    const db = client.db('shortener'); // ✅ 確保有這個 DB 名稱
    const collection = db.collection('urls');

    const short = custom || nanoid();

    const exists = await collection.findOne({ short });
    if (exists) return res.status(409).json({ error: 'Short code already exists' });

    await collection.insertOne({ short, url });
    return res.status(200).json({ short });
  } catch (err) {
    console.error('❌ API ERROR:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
