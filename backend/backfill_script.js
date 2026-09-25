import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

import Registration from "./src/models/Registration.js";
import Ticket from "./src/models/Ticket.js";
import EmailJob from "./src/models/EmailJob.js";
import Payment from "./src/models/Payment.js";
import User from "./src/models/User.js";
import Event from "./src/models/Event.js";
import Team from "./src/models/team.model.js";

const isDryRun = process.argv.includes("--dry-run");

async function runBackfill() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB. Dry run: ${isDryRun}`);

    const registrations = await Registration.find({
      status: "REGISTERED",
      paymentStatus: "PAID"
    }).populate("user").populate("event").populate("team").lean();

    let createCount = 0;
    let requeueCount = 0;
    let skipCount = 0;
    const actions = [];

    for (const reg of registrations) {
      const tickets = await Ticket.find({ registration: reg._id }).sort({ createdAt: 1 }).lean();
      if (tickets.length === 0) continue;
      
      const ticket = tickets[0];
      
      let participantEmail = "";
      let participantName = "";

      if (ticket.teamMemberId && reg.team && reg.team.members) {
        const member = reg.team.members.find(m => m._id.toString() === ticket.teamMemberId.toString());
        if (member) {
          participantEmail = member.participantEmail;
          participantName = member.participantName || "Team Member";
        }
      } else {
        participantEmail = reg.participantEmail;
        participantName = reg.participantName || "Participant";
      }

      if (!participantEmail && reg.user && reg.user.email) {
        participantEmail = reg.user.email;
        participantName = reg.user.fullName || participantName;
      }

      if (!participantEmail) {
        continue;
      }

      const payments = await Payment.find({
        registration: reg._id,
        paymentFor: "EVENT"
      }).sort({ createdAt: -1 }).lean();
      
      const payment = payments.length > 0 ? payments[0] : null;

      const existingJob = await EmailJob.findOne({
        registration: reg._id,
        type: "REGISTRATION_CONFIRMATION"
      }).sort({ createdAt: 1 }).lean();

      let action = "";

      // Step 5: Duplicate protection
      if ((payment && payment.confirmationEmailStatus === "SENT") || (existingJob && existingJob.status === "SENT")) {
        action = "SKIP_ALREADY_SENT";
        skipCount++;
      } else if (existingJob && existingJob.status === "FAILED") {
        action = "REQUEUE";
        requeueCount++;
        if (!isDryRun) {
          await EmailJob.updateOne(
            { _id: existingJob._id },
            {
              $set: {
                status: "PENDING",
                attempts: 0,
                lastError: null,
                nextAttemptAt: new Date(),
                lockedAt: null
              }
            }
          );
        }
      } else if (existingJob && (existingJob.status === "PENDING" || existingJob.status === "PROCESSING")) {
        action = "SKIP_PENDING_OR_PROCESSING";
        skipCount++;
      } else if (payment && (payment.confirmationEmailStatus === "FAILED" || payment.confirmationEmailStatus === "SENDING")) {
        // Here, it failed but there's no EmailJob (the earlier inline email failed)
        action = "CREATE"; // We must CREATE the email job so the new durable worker can retry it
        createCount++;
        if (!isDryRun) {
          await EmailJob.create({
            registration: reg._id,
            ticket: ticket._id,
            type: "REGISTRATION_CONFIRMATION",
            recipientEmail: participantEmail,
            recipientName: participantName,
            status: "PENDING",
            attempts: 0,
            nextAttemptAt: new Date(),
            maxAttempts: 5
          });
        }
      } else {
        // Missing entirely
        action = "CREATE";
        createCount++;
        if (!isDryRun) {
          await EmailJob.create({
            registration: reg._id,
            ticket: ticket._id,
            type: "REGISTRATION_CONFIRMATION",
            recipientEmail: participantEmail,
            recipientName: participantName,
            status: "PENDING",
            attempts: 0,
            nextAttemptAt: new Date(),
            maxAttempts: 5
          });
        }
      }

      actions.push({
        RegistrationID: reg._id.toString(),
        Participant: participantName,
        Email: participantEmail,
        Event: reg.event ? reg.event.title : "Unknown",
        CurrentStatus: existingJob ? existingJob.status : "NONE",
        Action: action
      });
    }

    console.table(actions);
    console.log(`\n--- SUMMARY ---`);
    console.log(`CREATE: ${createCount}`);
    console.log(`REQUEUE: ${requeueCount}`);
    console.log(`SKIP: ${skipCount}`);
    
    if (!isDryRun) {
        const totalPending = await EmailJob.countDocuments({ status: "PENDING" });
        const totalProcessing = await EmailJob.countDocuments({ status: "PROCESSING" });
        const totalSent = await EmailJob.countDocuments({ status: "SENT" });
        const totalFailed = await EmailJob.countDocuments({ status: "FAILED" });
        
        console.log(`\n--- CURRENT DB TOTALS ---`);
        console.log(`PENDING: ${totalPending}`);
        console.log(`PROCESSING: ${totalProcessing}`);
        console.log(`SENT: ${totalSent}`);
        console.log(`FAILED: ${totalFailed}`);
    }

  } catch (err) {
    console.error("Backfill error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

runBackfill();
