import mongoose from "mongoose";

import env from "../config/env.js";

import User from "../models/User.js";
import Festival from "../models/Festival.js";
import Event from "../models/Event.js";

import ROLES from "../constants/roles.js";

import {
  festivalData,
  demoEvents,
} from "./demoData.js";

/**
 * ============================================================
 * Final Scintillace Event Titles
 * ============================================================
 *
 * These are the only events that should exist for the
 * finalized Scintillace 2K26 event catalogue.
 */

const FINAL_EVENT_TITLES = [
  "Embedded & IoT with AI Workshop",
  "Paper Presentation",
  "Poster Presentation",
  "Hardware Expo",
  "Technical Quiz",
  "Spot Events",
];

/**
 * ============================================================
 * Seed Database
 * ============================================================
 */

async function seedDatabase() {
  try {
    console.log(
      "\n====================================",
    );

    console.log(
      "      Scintillace Database Seeder",
    );

    console.log(
      "====================================\n",
    );

    /**
     * ========================================================
     * MongoDB Connection
     * ========================================================
     */

    console.log(
      "Connecting to MongoDB...\n",
    );

    await mongoose.connect(
      env.mongoDbUri,
    );

    console.log(
      "✅ MongoDB Connected\n",
    );

    /**
     * ========================================================
     * SUPER ADMIN
     * ========================================================
     */

    let admin =
      await User.findOne({
        role: ROLES.SUPER_ADMIN,
      });

    if (!admin) {
      console.log(
        "No SUPER_ADMIN found. Creating one...\n",
      );

      admin =
        await User.create({
          fullName:
            "Scintillace Admin",

          email:
            "admin@scintillace.com",

          password:
            "Admin@123",

          phone:
            "9999999999",

          collegeId:
            "ADMIN001",

          role:
            ROLES.SUPER_ADMIN,

          isActive:
            true,

          isEmailVerified:
            true,
        });

      console.log(
        "✅ SUPER_ADMIN created",
      );

      console.log(
        "Email    : admin@scintillace.com",
      );

      console.log(
        "Password : Admin@123\n",
      );
    } else {
      console.log(
        `✅ SUPER_ADMIN found (${admin.fullName})\n`,
      );
    }

    /**
     * ========================================================
     * FESTIVAL
     * ========================================================
     */

    let festival =
      await Festival.findOne({
        title:
          festivalData.title,
      });

    /**
     * --------------------------------------------------------
     * Create Festival
     * --------------------------------------------------------
     */

    if (!festival) {
      festival =
        await Festival.create({
          ...festivalData,

          createdBy:
            admin._id,
        });

      console.log(
        `✅ Festival created : ${festival.title}\n`,
      );
    }

    /**
     * --------------------------------------------------------
     * Update Existing Festival
     * --------------------------------------------------------
     *
     * Ensures the current finalized festival information
     * is reflected in the database.
     */

    else {
      festival.title =
        festivalData.title;

      festival.description =
        festivalData.description;

      festival.theme =
        festivalData.theme;

      festival.startDate =
        festivalData.startDate;

      festival.endDate =
        festivalData.endDate;

      festival.venue =
        festivalData.venue;

      festival.status =
        festivalData.status;

      /**
       * Festival schema uses bannerUrl.
       *
       * Older seed data may contain bannerImage,
       * so only update bannerUrl when it exists
       * in festivalData.
       */

      if (
        festivalData.bannerUrl !==
        undefined
      ) {
        festival.bannerUrl =
          festivalData.bannerUrl;
      }

      if (
        festivalData.registrationOpen !==
        undefined
      ) {
        festival.registrationOpen =
          festivalData.registrationOpen;
      }

      festival.createdBy =
        festival.createdBy ||
        admin._id;

      await festival.save();

      console.log(
        `ℹ Festival updated : ${festival.title}\n`,
      );
    }

    /**
     * ========================================================
     * Validate Event Seed Data
     * ========================================================
     *
     * The seed should contain exactly the six finalized
     * Scintillace events.
     */

    const seedTitles =
      demoEvents.map(
        (event) => event.title,
      );

    const missingTitles =
      FINAL_EVENT_TITLES.filter(
        (title) =>
          !seedTitles.includes(
            title,
          ),
      );

    const unexpectedTitles =
      seedTitles.filter(
        (title) =>
          !FINAL_EVENT_TITLES.includes(
            title,
          ),
      );

    if (
      missingTitles.length > 0
    ) {
      throw new Error(
        `Missing finalized events in demoData.js: ${missingTitles.join(", ")}`,
      );
    }

    if (
      unexpectedTitles.length > 0
    ) {
      throw new Error(
        `Unexpected events in demoData.js: ${unexpectedTitles.join(", ")}`,
      );
    }

    /**
     * ========================================================
     * Remove Existing Scintillace Events
     * ========================================================
     *
     * We remove:
     *
     * 1. All events currently associated with this festival.
     *
     * 2. Any existing records with one of the finalized
     *    event titles.
     *
     * The second condition handles older records that were
     * created using a different Festival ObjectId.
     *
     * Other unrelated events are untouched.
     */

    const OLD_DEMO_EVENT_TITLES = [
  "Circuit Debugging",
  "Coding Challenge",
  "PCB Design Workshop",
  "Project Expo",
  "Treasure Hunt",
];

const deleteResult =
  await Event.deleteMany({
    $or: [
      {
        festival:
          festival._id,
      },
      {
        title: {
          $in: FINAL_EVENT_TITLES,
        },
      },
      {
        title: {
          $in:
            OLD_DEMO_EVENT_TITLES,
        },
      },
    ],
  });

console.log(
  `🧹 Existing Scintillace/demo events removed : ${deleteResult.deletedCount}`,
);

    console.log(
      `🧹 Existing Scintillace events removed : ${deleteResult.deletedCount}`,
    );

    /**
     * ========================================================
     * Prepare Finalized Events
     * ========================================================
     */

    const eventsToInsert =
      demoEvents.map(
        (event) => ({
          ...event,

          festival:
            festival._id,

          createdBy:
            admin._id,
        }),
      );

    /**
     * ========================================================
     * Insert Finalized Events
     * ========================================================
     */

    const insertedEvents =
      await Event.insertMany(
        eventsToInsert,
      );

    /**
     * ========================================================
     * Event Summary
     * ========================================================
     */

    console.log(
      `\n✅ Finalized events inserted : ${insertedEvents.length}`,
    );

    insertedEvents.forEach(
      (event, index) => {
        console.log(
          `   ${index + 1}. ${event.title}`,
        );
      },
    );

    /**
     * ========================================================
     * Final Summary
     * ========================================================
     */

    console.log(
      "\n====================================",
    );

    console.log(
      "         Seeding Completed",
    );

    console.log(
      "====================================\n",
    );

    console.log(
      `Festival : ${festival.title}`,
    );

    console.log(
      `Events   : ${insertedEvents.length}`,
    );

    console.log(
      "\nFinal event database contains:",
    );

    insertedEvents.forEach(
      (event) => {
        console.log(
          `✓ ${event.title}`,
        );
      },
    );

    console.log(
      "\nDatabase Ready.\n",
    );

    /**
     * ========================================================
     * Disconnect
     * ========================================================
     */

    await mongoose.disconnect();

    console.log(
      "MongoDB disconnected.",
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "\n❌ Seeder Failed\n",
    );

    console.error(error);

    /**
     * Safely disconnect if a connection
     * was established.
     */

    if (
      mongoose.connection.readyState !==
      0
    ) {
      await mongoose.disconnect();
    }

    process.exit(1);
  }
}

/**
 * ============================================================
 * Start Seeder
 * ============================================================
 */

seedDatabase();