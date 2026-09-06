import mongoose from "mongoose";
import dotenv from "dotenv";
import Event from "./src/models/Event.js";

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const events = await Event.find({}).lean();
  for (let e of events) {
      console.log(`Event ID: ${e._id}, Title: ${e.title}, Type: ${e.type}`);
  }

  await mongoose.disconnect();
}
check().catch(console.error);
