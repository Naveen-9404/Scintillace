import { MongoClient } from 'mongodb';

const uri = "mongodb://festsphere_admin:ECEfest123@ac-uspluvx-shard-00-00.qsye7zy.mongodb.net:27017,ac-uspluvx-shard-00-01.qsye7zy.mongodb.net:27017,ac-uspluvx-shard-00-02.qsye7zy.mongodb.net:27017/festsphere?ssl=true&replicaSet=atlas-8wiww9-shard-0&authSource=admin&appName=Cluster0";

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('festsphere');
    const accommodations = db.collection('accommodations');
    
    // Drop the old index
    console.log("Dropping old index...");
    await accommodations.dropIndex("registration_1_teamMemberId_1");
    console.log("Dropped.");

    // Create the new partial unique index
    console.log("Creating new index...");
    await accommodations.createIndex(
      { registration: 1, teamMemberId: 1 },
      {
        unique: true,
        name: "registration_1_teamMemberId_1",
        partialFilterExpression: {
          registration: { $type: "objectId" }
        }
      }
    );
    console.log("Created.");

    // Verify all indexes
    const indexes = await accommodations.indexes();
    console.log("Final indexes:");
    console.log(JSON.stringify(indexes, null, 2));

  } finally {
    await client.close();
  }
}

run().catch(console.error);
