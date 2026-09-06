import mongoose from "mongoose";
import dotenv from "dotenv";
import registrationRepository from "./src/repositories/registration.repository.js";
import { REGISTRATION_STATUS } from "./src/constants/registration.constants.js";
import Registration from "./src/models/Registration.js";

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Test finding email 'test@example.com' for a different event
  // Workshop = 6a8937a5bebeb93493556c6c (test@example.com is registered for this)
  // Paper Presentation = 6a8937a5bebeb93493556c6d
  
  const workshopId = "6a8937a5bebeb93493556c6c";
  const paperId = "6a8937a5bebeb93493556c6d";
  const email = "test@example.com";

  console.log("Checking Workshop:", await registrationRepository.findActiveByEmailAndEvent(email, workshopId));
  console.log("Checking Paper:", await registrationRepository.findActiveByEmailAndEvent(email, paperId));

  await mongoose.disconnect();
}
test().catch(console.error);
