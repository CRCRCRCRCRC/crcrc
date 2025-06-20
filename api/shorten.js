import { MongoClient } from 'mongodb';
import { customAlphabet } from 'nanoid';

const uri = process.env.MONGO_URI;
const options = {};
let client;
let clientPromise;

if (!process.env.MONGO_URI) {
  throw new Error('❌ 請設定 MONGO_URI 環境變數');
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, custom } = req.body;
    if (!url) return res.status(400).json({ error: 'Missing URL' });

    const client = await clientPromise;
    const db = client.db('shortener');
    const collection = db.collection('urls');

    const short = custom || nanoid();

    const exists = await collection.findOne({ short });
    if (exists) return res.status(409).json({ error: 'Short code already exists' });

    await collection.insertOne({ short, url });

    return res.status(200).json({ short });
  } catch (err) {
    console.error('❌ API ERROR:', err);
    return res.status(500).json({ error: 'Server error', detail: err.message || 'Unknown error' });
  }
}
