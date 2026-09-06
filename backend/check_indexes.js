import { MongoClient } from 'mongodb';

const uri = "mongodb://festsphere_admin:ECEfest123@ac-uspluvx-shard-00-00.qsye7zy.mongodb.net:27017,ac-uspluvx-shard-00-01.qsye7zy.mongodb.net:27017,ac-uspluvx-shard-00-02.qsye7zy.mongodb.net:27017/festsphere?ssl=true&replicaSet=atlas-8wiww9-shard-0&authSource=admin&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('festsphere');
    const accommodations = database.collection('accommodations');
    const indexes = await accommodations.indexes();
    console.log(JSON.stringify(indexes, null, 2));
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
