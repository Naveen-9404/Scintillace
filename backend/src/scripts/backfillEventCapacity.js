import mongoose from "mongoose";

import { initializeDatabase } from "../config/database.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import {
  REGISTRATION_STATUS,
} from "../constants/registration.constants.js";

/**
 * One-off migration for events created before registeredParticipantCount was
 * introduced. Run while registration changes are paused so the counter starts
 * from a consistent confirmed-registration snapshot.
 */
const backfillEventCapacity =
  async () => {
    await initializeDatabase();

    const events =
      await Event.find({})
        .select("_id")
        .lean();

    for (const event of events) {
      const registrations =
        await Registration.find({
          event: event._id,
          status:
            REGISTRATION_STATUS.REGISTERED,
        })
          .select("team")
          .populate({
            path: "team",
            select: "members",
          })
          .lean();

      const participantCount =
        registrations.reduce(
          (total, registration) =>
            total +
            (
              registration.team?.members?.length ||
              1
            ),
          0,
        );

      await Event.updateOne(
        {
          _id: event._id,
        },
        {
          $set: {
            registeredParticipantCount:
              participantCount,
          },
        },
      );
    }
  };

backfillEventCapacity()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error(
      "Event capacity backfill failed.",
      error,
    );

    await mongoose.disconnect();
    process.exitCode = 1;
  });
