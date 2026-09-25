import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import Registration from "./src/models/Registration.js";
import EmailJob from "./src/models/EmailJob.js";
import Payment from "./src/models/Payment.js";
import User from "./src/models/User.js";
import Event from "./src/models/Event.js";
import Team from "./src/models/team.model.js";

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const registrations = await Registration.find({
      status: "REGISTERED",
      paymentStatus: "PAID"
    }).populate("user").populate("event").populate("team").lean();

    const report = [];
    let pending = 0;
    let processing = 0;
    let sent = 0;
    let failed = 0;
    
    // Track duplicates across the 22 registrations
    let duplicateSent = 0;

    for (const reg of registrations) {
      const jobs = await EmailJob.find({
        registration: reg._id,
        type: "REGISTRATION_CONFIRMATION"
      }).sort({ createdAt: 1 }).lean();

      const skippedIds = [
        '6a8b3b3451a184ed84ce6c58',
        '6a8b3b9151a184ed84ce6c5c',
        '6a8c57dff41a1548d0d56566',
        '6a8c58a9f41a1548d0d5656c',
        '6a8d06a3787381bf577e2aba'
      ];
      if (skippedIds.includes(reg._id.toString())) {
        continue; 
      }

      if (jobs.length > 0) {
        // Find duplicate SENT jobs across all jobs for this registration
        const sentJobs = jobs.filter(j => j.status === "SENT");
        if (sentJobs.length > 1) {
            duplicateSent++;
        }

        let targetJob = jobs.find(j => ["PENDING", "PROCESSING", "SENT"].includes(j.status));
        if (!targetJob) {
           targetJob = jobs[0];
        }
        
        report.push({
          RegistrationID: reg._id.toString(),
          Participant: targetJob.recipientName,
          Email: targetJob.recipientEmail,
          Event: reg.event ? reg.event.title : "Unknown",
          EmailJobID: targetJob._id.toString(),
          Status: targetJob.status,
          Attempts: targetJob.attempts,
          SentAt: targetJob.sentAt ? targetJob.sentAt.toISOString() : "N/A",
          LastError: targetJob.lastError || "None",
          NextAttemptAt: targetJob.nextAttemptAt ? targetJob.nextAttemptAt.toISOString() : "N/A"
        });

        if (targetJob.status === "PENDING") pending++;
        else if (targetJob.status === "PROCESSING") processing++;
        else if (targetJob.status === "SENT") sent++;
        else if (targetJob.status === "FAILED") failed++;
      }
    }

    console.table(report);
    console.log(`\nPENDING: ${pending}`);
    console.log(`PROCESSING: ${processing}`);
    console.log(`SENT: ${sent}`);
    console.log(`FAILED: ${failed}`);
    console.log(`\nDUPLICATE SENT JOBS: ${duplicateSent}`);

  } catch (err) {
    console.error("Verification error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

verify();
