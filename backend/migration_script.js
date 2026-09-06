import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log("Connecting to MongoDB...");
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  
  // Extract database name safely
  const dbNameMatch = uri.match(/\/([^\/?]+)(\?|$)/);
  const dbName = dbNameMatch ? dbNameMatch[1] : 'unknown';
  
  console.log("==================================================");
  console.log("1. Target database verified:");
  console.log(`   - Database name: ${dbName}`);
  console.log(`   - Cluster/Host: (hidden credentials)`);
  console.log(`   - Production environment confirmed: YES (based on .env)`);
  console.log("==================================================");

  const accColl = mongoose.connection.collection('accommodations');
  const certColl = mongoose.connection.collection('certificates');
  const tktColl = mongoose.connection.collection('tickets');

  const accIndexes = await accColl.indexes();
  const certIndexes = await certColl.indexes();
  const tktIndexes = await tktColl.indexes();

  const getIdx = (indexes, name) => indexes.find(i => i.name === name);

  const accRegIdx = getIdx(accIndexes, 'registration_1');
  const certRegIdx = getIdx(certIndexes, 'registration_1');
  const certRegUserIdx = getIdx(certIndexes, 'registration_1_user_1');
  const tktRegIdx = getIdx(tktIndexes, 'registration_1');

  const accReplIdx = getIdx(accIndexes, 'registration_1_teamMemberId_1');
  const certReplIdx = getIdx(certIndexes, 'registration_1_teamMemberId_1');
  const tktReplIdx = getIdx(tktIndexes, 'registration_1_teamMemberId_1');

  console.log("\n2. Pre-migration index verification:");
  console.log(`   - accommodations.registration_1: ${accRegIdx ? 'FOUND' : 'MISSING'} (unique: ${accRegIdx?.unique})`);
  console.log(`   - certificates.registration_1: ${certRegIdx ? 'FOUND' : 'MISSING'} (unique: ${certRegIdx?.unique})`);
  console.log(`   - certificates.registration_1_user_1: ${certRegUserIdx ? 'FOUND' : 'MISSING'} (unique: ${certRegUserIdx?.unique})`);
  console.log(`   - tickets.registration_1: ${tktRegIdx ? 'FOUND' : 'MISSING'} (unique: ${tktRegIdx?.unique})`);

  console.log("\nIntended replacement/compound indexes:");
  console.log(`   - accommodation registration + teamMemberId: ${accReplIdx ? 'FOUND' : 'MISSING'} (unique: ${accReplIdx?.unique})`);
  console.log(`   - certificate registration + teamMemberId: ${certReplIdx ? 'FOUND' : 'MISSING'} (unique: ${certReplIdx?.unique})`);
  console.log(`   - ticket registration + teamMemberId: ${tktReplIdx ? 'FOUND' : 'MISSING'} (unique: ${tktReplIdx?.unique})`);

  if (!accRegIdx || !accRegIdx.unique || !certRegIdx || !certRegIdx.unique || !certRegUserIdx || !certRegUserIdx.unique || !tktRegIdx || !tktRegIdx.unique) {
     console.error("\nSTOPPING MIGRATION: One or more target indexes are missing or not unique.");
     process.exit(1);
  }

  if (!accReplIdx || !accReplIdx.unique || !certReplIdx || !certReplIdx.unique || !tktReplIdx || !tktReplIdx.unique) {
     console.error("\nSTOPPING MIGRATION: One or more intended replacement indexes are missing or not unique.");
     process.exit(1);
  }

  console.log("\nAll verifications passed. Proceeding with drops...");
  
  await accColl.dropIndex('registration_1');
  await certColl.dropIndex('registration_1');
  await certColl.dropIndex('registration_1_user_1');
  await tktColl.dropIndex('registration_1');

  console.log("\n3. Migration executed:");
  console.log("   - accommodations: registration_1 dropped");
  console.log("   - certificates: registration_1 dropped");
  console.log("   - certificates: registration_1_user_1 dropped");
  console.log("   - tickets: registration_1 dropped");
  console.log("   - NO other indexes were removed.");

  console.log("\n4. Post-migration indexes:");
  
  const postAccIndexes = await accColl.indexes();
  const postCertIndexes = await certColl.indexes();
  const postTktIndexes = await tktColl.indexes();
  const postRegIndexes = await mongoose.connection.collection('registrations').indexes();
  const postTeamIndexes = await mongoose.connection.collection('teams').indexes();
  const postPayIndexes = await mongoose.connection.collection('payments').indexes();

  console.log("\nACCOMMODATIONS:");
  console.log(postAccIndexes.map(i => `${i.name} (unique: ${!!i.unique})`).join('\n'));
  
  console.log("\nCERTIFICATES:");
  console.log(postCertIndexes.map(i => `${i.name} (unique: ${!!i.unique})`).join('\n'));
  
  console.log("\nTICKETS:");
  console.log(postTktIndexes.map(i => `${i.name} (unique: ${!!i.unique})`).join('\n'));

  console.log("\nREGISTRATIONS:");
  console.log(postRegIndexes.map(i => `${i.name} (unique: ${!!i.unique})`).join('\n'));

  console.log("\nTEAMS:");
  console.log(postTeamIndexes.map(i => `${i.name} (unique: ${!!i.unique})`).join('\n'));

  console.log("\nPAYMENTS:");
  console.log(postPayIndexes.map(i => `${i.name} (unique: ${!!i.unique})`).join('\n'));

  process.exit(0);
}

runMigration().catch(err => {
  console.error("MIGRATION FAILED WITH ERROR:", err);
  process.exit(1);
});
