import mongoose from "mongoose";
import dotenv from "dotenv";
import Registration from "./src/models/Registration.js";

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const regs = await Registration.find({}).lean();
  
  // Group by email
  const byEmail = {};
  for (let r of regs) {
      if (r.participantEmail) {
          if (!byEmail[r.participantEmail]) byEmail[r.participantEmail] = [];
          byEmail[r.participantEmail].push(r.event.toString());
      }
  }
  
  for (let email in byEmail) {
      console.log(`Email: ${email} -> Events: ${byEmail[email].join(", ")}`);
  }

  await mongoose.disconnect();
}
check().catch(console.error);
