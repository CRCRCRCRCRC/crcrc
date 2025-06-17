import { MongoClient } from 'mongodb';

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

export default async function handler(req, res) {
  try {
    const {
      query: { code },
    } = req;

    if (!code) return res.status(400).send('Missing short code');

    const client = await clientPromise;
    const db = client.db('shortener');
    const collection = db.collection('urls');

    const entry = await collection.findOne({ short: code });
    if (!entry) return res.status(404).send('Short URL not found');

    return res.redirect(301, entry.url);
  } catch (err) {
    console.error('❌ Redirect API ERROR:', err);
    return res.status(500).send('Server error');
  }
}
