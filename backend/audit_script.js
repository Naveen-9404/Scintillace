import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function runAudit() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const collections = [
    'registrations',
    'teams',
    'payments',
    'tickets',
    'certificates',
    'accommodations',
    'users',
    'events',
    'festivals'
  ];

  for (const collName of collections) {
    try {
      console.log(`\n==================================================`);
      console.log(`COLLECTION: ${collName}`);
      
      const coll = mongoose.connection.collection(collName);
      
      const indexes = await coll.indexes();
      console.log(`INDEXES:`);
      console.log(JSON.stringify(indexes, null, 2));

      // Fetch a sample document
      const sample = await coll.findOne({});
      if (sample) {
        // Redact PII
        if (sample.participantName) sample.participantName = "***";
        if (sample.participantEmail) sample.participantEmail = "***";
        if (sample.participantPhone) sample.participantPhone = "***";
        if (sample.email) sample.email = "***";
        if (sample.fullName) sample.fullName = "***";
        if (sample.mobile) sample.mobile = "***";
        if (sample.leaderName) sample.leaderName = "***";
        if (sample.leaderEmail) sample.leaderEmail = "***";
        if (sample.screenshotUrl) sample.screenshotUrl = "***";
        if (sample.screenshotPublicId) sample.screenshotPublicId = "***";
        if (sample.guestToken) sample.guestToken = "***";
        if (sample.guestTokenHash) sample.guestTokenHash = "***";
        if (sample.password) sample.password = "***";
        if (sample.refreshToken) sample.refreshToken = "***";
        
        // Redact team members
        if (sample.members && Array.isArray(sample.members)) {
           sample.members.forEach(m => {
             if (m.name) m.name = "***";
             if (m.email) m.email = "***";
             if (m.phone) m.phone = "***";
           });
        }

        console.log(`SAMPLE DOCUMENT:`);
        console.log(JSON.stringify(sample, null, 2));
      } else {
        console.log(`SAMPLE DOCUMENT: (No documents found)`);
      }
    } catch (err) {
      console.error(`Error querying ${collName}:`, err.message);
    }
  }

  console.log("\nAudit complete.");
  process.exit(0);
}

runAudit();
