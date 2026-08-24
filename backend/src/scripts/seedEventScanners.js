import mongoose from "mongoose";

import env from "../config/env.js";

import User from "../models/User.js";
import Event from "../models/Event.js";
import Volunteer from "../models/Volunteer.js";

import ROLES from "../constants/roles.js";

const SCANNER_COUNT = 3;

const SCANNER_PASSWORD_PREFIX = "Scintillace@2026";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 45);

const run = async () => {
  try {
    console.log("\n========================================");
    console.log(" FESTSPHERE EVENT SCANNER SEED");
    console.log("========================================\n");

    await mongoose.connect(
      env.mongoDbUri,
    );

    console.log(
      "MongoDB connected successfully.\n",
    );

    /**
     * --------------------------------------------------------
     * Find an existing SUPER_ADMIN.
     * --------------------------------------------------------
     */

    const admin =
      await User.findOne({
        role: ROLES.SUPER_ADMIN,
        isActive: true,
      });

    if (!admin) {
      throw new Error(
        "No active SUPER_ADMIN account was found.",
      );
    }

    console.log(
      `Assignment owner: ${admin.email}\n`,
    );

    /**
     * --------------------------------------------------------
     * Get all events.
     * --------------------------------------------------------
     */

    const events =
      await Event.find({})
        .sort({
          createdAt: 1,
        })
        .lean();

    if (!events.length) {
      console.log(
        "No events found. Nothing to create.",
      );

      return;
    }

    console.log(
      `Found ${events.length} event(s).\n`,
    );

    const credentials = [];

    /**
     * --------------------------------------------------------
     * Process every event.
     * --------------------------------------------------------
     */

    for (const event of events) {
      const eventSlug =
        slugify(event.title) ||
        `event-${event._id}`;

      console.log(
        `\nEvent: ${event.title}`,
      );

      console.log(
        `Event ID: ${event._id}`,
      );

      for (
        let index = 1;
        index <= SCANNER_COUNT;
        index += 1
      ) {
        const scannerNumber =
          String(index).padStart(2, "0");

        const email =
          `${eventSlug}-scanner-${scannerNumber}@scintillace.local`;

        const password =
          `${SCANNER_PASSWORD_PREFIX}-${scannerNumber}`;

        /**
         * ----------------------------------------------------
         * Find or create User
         * ----------------------------------------------------
         */

        let user =
          await User.findOne({
            email,
          });

        if (!user) {
          user =
            await User.create({
              fullName:
                `${event.title} Scanner ${index}`,

              email,

              authProvider:
                "LOCAL",

              password,

              phone:
                "0000000000",

              collegeId:
                `SCANNER-${event._id}-${scannerNumber}`,

              role:
                ROLES.VOLUNTEER,

              isActive: true,

              isEmailVerified: true,
            });

          console.log(
            `  ✓ Created user: ${email}`,
          );
        } else {
          /**
           * Existing account.
           *
           * Make sure it remains a scanner account.
           */

          let changed = false;

          if (
            user.role !==
            ROLES.VOLUNTEER
          ) {
            user.role =
              ROLES.VOLUNTEER;

            changed = true;
          }

          if (!user.isActive) {
            user.isActive = true;

            changed = true;
          }

          if (
            user.authProvider !==
            "LOCAL"
          ) {
            user.authProvider =
              "LOCAL";

            changed = true;
          }

          if (changed) {
            await user.save();

            console.log(
              `  ✓ Updated user: ${email}`,
            );
          } else {
            console.log(
              `  → Existing user: ${email}`,
            );
          }
        }

        /**
         * ----------------------------------------------------
         * Create event assignment
         * ----------------------------------------------------
         */

        let assignment =
          await Volunteer.findOne({
            user: user._id,
            festival:
              event.festival,
            event: event._id,
          });

        if (!assignment) {
          assignment =
            await Volunteer.create({
              user: user._id,

              festival:
                event.festival,

              event:
                event._id,

              assignmentRole:
                "CHECK_IN_SCANNER",

              department:
                "EVENT CHECK-IN",

              responsibilities:
                "Scan participant QR tickets and perform event check-in.",

              availability:
                "EVENT_ONLY",

              status:
                "ACTIVE",

              checkedIn:
                false,

              checkedOut:
                false,

              assignedBy:
                admin._id,

              updatedBy:
                admin._id,
            });

          console.log(
            `  ✓ Assigned scanner ${index} to event`,
          );
        } else {
          /**
           * Ensure the assignment remains active.
           */

          assignment.status =
            "ACTIVE";

          assignment.assignmentRole =
            "CHECK_IN_SCANNER";

          assignment.department =
            "EVENT CHECK-IN";

          assignment.availability =
            "EVENT_ONLY";

          assignment.updatedBy =
            admin._id;

          await assignment.save();

          console.log(
            `  → Existing assignment confirmed`,
          );
        }

        credentials.push({
          event:
            event.title,

          eventId:
            event._id.toString(),

          scanner:
            index,

          email,

          password,
        });
      }
    }

    /**
     * --------------------------------------------------------
     * Print credentials
     * --------------------------------------------------------
     */

    console.log(
      "\n\n========================================",
    );

    console.log(
      " SCANNER LOGIN CREDENTIALS",
    );

    console.log(
      "========================================\n",
    );

    for (const credential of credentials) {
      console.log(
        `Event    : ${credential.event}`,
      );

      console.log(
        `Event ID : ${credential.eventId}`,
      );

      console.log(
        `Scanner  : ${credential.scanner}`,
      );

      console.log(
        `Email    : ${credential.email}`,
      );

      console.log(
        `Password : ${credential.password}`,
      );

      console.log(
        "----------------------------------------",
      );
    }

    console.log(
      `\nCreated/verified ${credentials.length} scanner account assignments.`,
    );

    console.log(
      "\n========================================\n",
    );
  } catch (error) {
    console.error(
      "\nScanner seed failed:",
    );

    console.error(error);

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();

    console.log(
      "MongoDB connection closed.",
    );
  }
};

run();