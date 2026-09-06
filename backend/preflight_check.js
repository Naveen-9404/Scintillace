import { MongoClient } from 'mongodb';

const uri = "mongodb://festsphere_admin:ECEfest123@ac-uspluvx-shard-00-00.qsye7zy.mongodb.net:27017,ac-uspluvx-shard-00-01.qsye7zy.mongodb.net:27017,ac-uspluvx-shard-00-02.qsye7zy.mongodb.net:27017/festsphere?ssl=true&replicaSet=atlas-8wiww9-shard-0&authSource=admin&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('festsphere');
    const accommodations = db.collection('accommodations');
    
    // 1. Get indexes
    const indexes = await accommodations.indexes();
    
    // 2. Duplicate registration + teamMemberId records
    const duplicates = await accommodations.aggregate([
      { $match: { registration: { $type: "objectId" } } },
      { $group: {
          _id: { registration: "$registration", teamMemberId: "$teamMemberId" },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]).toArray();
    
    // 3. Existing standalone accommodation records
    const standaloneCount = await accommodations.countDocuments({
      registration: { $not: { $type: "objectId" } } // matches null or missing
    });

    console.log(JSON.stringify({
      indexes,
      duplicatesCount: duplicates.length,
      duplicates,
      standaloneCount
    }, null, 2));

  } finally {
    await client.close();
  }
}

run().catch(console.error);
