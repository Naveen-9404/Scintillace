import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

async function run() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    console.log("Connected. Database Name:", db.databaseName);
    
    const collection = db.collection("payments");
    
    console.log("\nCurrent indexes on 'payments' collection:");
    let indexes = await collection.indexes();
    indexes.forEach(idx => {
      console.log(`- ${idx.name} (unique: ${idx.unique || false})`);
    });
    
    const orderIdIndex = indexes.find(idx => idx.name === "orderId_1");
    if (!orderIdIndex) {
      console.log("\nERROR: Index 'orderId_1' not found. Stopping.");
      process.exit(1);
    }
    
    if (!orderIdIndex.unique) {
      console.log("\nWARNING: Index 'orderId_1' exists but is not unique.");
    }
    
    console.log("\nConfirming Payment schema does not use orderId...");
    const paymentSchemaStr = fs.readFileSync(path.join(process.cwd(), "src", "models", "Payment.js"), "utf8");
    if (paymentSchemaStr.includes("orderId: {")) {
      console.log("ERROR: Payment schema still contains orderId. Stopping.");
      process.exit(1);
    } else {
      console.log("Confirmed: Payment schema does not contain orderId field.");
    }
    
    console.log("\nDropping index 'orderId_1'...");
    await collection.dropIndex("orderId_1");
    console.log("Index dropped successfully.");
    
    console.log("\nRemaining indexes on 'payments' collection:");
    indexes = await collection.indexes();
    indexes.forEach(idx => {
      console.log(`- ${idx.name} (unique: ${idx.unique || false})`);
    });
    
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

run();
