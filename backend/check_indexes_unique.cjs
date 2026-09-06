const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const collections = ['registrations', 'teams', 'payments', 'accommodations', 'certificates'];
    
    for (const collName of collections) {
        console.log(\n--- Indexes for  ---);
        try {
            const collection = db.collection(collName);
            const indexes = await collection.indexes();
            indexes.forEach(idx => console.log(${idx.name} (unique: )));
        } catch (e) {
            console.log(Collection  error: );
        }
    }
    await mongoose.disconnect();
}

main().catch(console.error);
