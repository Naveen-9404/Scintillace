import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

import Registration from "./src/models/Registration.js";
import Payment from "./src/models/Payment.js";
import EmailJob from "./src/models/EmailJob.js";
import User from "./src/models/User.js";
import Event from "./src/models/Event.js";
import Team from "./src/models/team.model.js";

async function runAudit() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for Audit");

    const registrations = await Registration.find({
      status: "REGISTERED",
      paymentStatus: "PAID"
    })
    .populate("user")
    .populate("event")
    .populate("team")
    .lean();

    console.log(`Found ${registrations.length} REGISTERED and PAID registrations.`);

    const report = [];
    const totals = {
      totalRegisteredAndPaid: registrations.length,
      confirmedSent: 0,
      pendingQueued: 0,
      missingEmailJob: 0,
      failed: 0,
      invalidData: 0
    };

    for (const reg of registrations) {
      let pEmail = reg.participantEmail;
      let pName = reg.participantName;

      if (!pEmail && reg.user) {
         pEmail = reg.user.email;
      }
      if (!pName && reg.user) {
         pName = reg.user.fullName;
      }

      if (!pEmail) {
        totals.invalidData++;
        continue;
      }

      const payments = await Payment.find({
        registration: reg._id,
        paymentFor: "EVENT"
      }).sort({ createdAt: -1 }).lean();
      
      const payment = payments.length > 0 ? payments[0] : null;

      const emailJob = await EmailJob.findOne({
        registration: reg._id,
        type: "REGISTRATION_CONFIRMATION"
      }).sort({ createdAt: -1 }).lean();

      let classification = "";

      if ((payment && payment.confirmationEmailStatus === "SENT") || (emailJob && emailJob.status === "SENT")) {
         classification = "CONFIRMED SENT";
      } else if (emailJob && (emailJob.status === "PENDING" || emailJob.status === "PROCESSING")) {
         classification = "PENDING/QUEUED";
      } else if (emailJob && emailJob.status === "FAILED") {
         classification = "FAILED";
      } else if (payment && (payment.confirmationEmailStatus === "FAILED" || payment.confirmationEmailStatus === "SENDING")) {
         classification = "FAILED";
      } else if (!emailJob) {
         classification = "MISSING EMAIL JOB";
      } else {
         classification = "MISSING EMAIL JOB";
      }

      if (classification === "CONFIRMED SENT") totals.confirmedSent++;
      else if (classification === "PENDING/QUEUED") totals.pendingQueued++;
      else if (classification === "MISSING EMAIL JOB") totals.missingEmailJob++;
      else if (classification === "FAILED") totals.failed++;

      report.push({
        RegistrationID: reg._id.toString(),
        ParticipantName: pName,
        ParticipantEmail: pEmail,
        Event: reg.event ? reg.event.title : "Unknown Event",
        TeamName: reg.team ? reg.team.teamName : "N/A",
        RegistrationStatus: reg.status,
        PaymentStatus: reg.paymentStatus,
        Classification: classification,
        PaymentConfirmationEmailStatus: payment ? payment.confirmationEmailStatus : "NO_PAYMENT_FOUND",
        EmailJobStatus: emailJob ? emailJob.status : "NO_JOB"
      });
    }

    const fileOut = "./audit_output_reg.json";
    fs.writeFileSync(fileOut, JSON.stringify({ totals, report }, null, 2));
    
    console.log("Totals:", totals);
    console.log("Audit complete. Results written to", fileOut);

  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    await mongoose.disconnect();
  }
}

runAudit();
