import mongoose from "mongoose";
import dotenv from "dotenv";
import Registration from "./src/models/Registration.js";

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const regs = await Registration.find({}).lean();
  console.log("Total registrations:", regs.length);
  for (let r of regs) {
      console.log(`Email: ${r.participantEmail}, Event: ${r.event}, Status: ${r.status}`);
  }

  await mongoose.disconnect();
}
check().catch(console.error);
