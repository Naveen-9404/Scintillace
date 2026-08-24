import EventVolunteer from "../models/EventVolunteer.js";

/**
 * ============================================================
 * Volunteer Population Configuration
 * ============================================================
 */

const volunteerPopulate = [
  {
    path: "volunteer",
    select:
      "fullName email phone collegeId role isActive isEmailVerified",
  },

  {
    path: "event",
    select:
      "title category type status startDateTime endDateTime venue festival",
  },

  {
    path: "assignedBy",
    select:
      "fullName email role",
  },

  {
    path: "removedBy",
    select:
      "fullName email role",
  },
];

/**
 * ============================================================
 * Create Assignment
 * ============================================================
 */

const create = async (
  assignmentData,
  options = {},
) => {
  const [assignment] =
    await EventVolunteer.create(
      [assignmentData],
      options,
    );

  return assignment;
};

/**
 * ============================================================
 * Find Assignment By ID
 * ============================================================
 */

const findById = (
  assignmentId,
) => {
  return EventVolunteer.findById(
    assignmentId,
  )
    .populate(volunteerPopulate)
    .exec();
};

/**
 * ============================================================
 * Find Assignment By ID - Raw
 * ============================================================
 */

const findByIdRaw = (
  assignmentId,
) => {
  return EventVolunteer.findById(
    assignmentId,
  )
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Active Assignment
 * ============================================================
 *
 * Used primarily during ticket check-in authorization.
 *
 * Checks whether a specific volunteer is actively assigned
 * to a specific event.
 */

const findActiveAssignment = (
  eventId,
  volunteerId,
) => {
  return EventVolunteer.findOne({
    event: eventId,
    volunteer: volunteerId,
    status: "ACTIVE",
  })
    .lean()
    .exec();
};

/**
 * ============================================================
 * Assignment Exists
 * ============================================================
 */

const assignmentExists = (
  eventId,
  volunteerId,
) => {
  return EventVolunteer.exists({
    event: eventId,
    volunteer: volunteerId,
    status: "ACTIVE",
  }).then(Boolean);
};

/**
 * ============================================================
 * Get Active Volunteers By Event
 * ============================================================
 */

const getActiveByEvent = (
  eventId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return EventVolunteer.find({
    event: eventId,
    status: "ACTIVE",
  })
    .populate(volunteerPopulate)
    .sort({
      assignedAt: -1,
    })
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Active Volunteers By Event
 * ============================================================
 */

const countActiveByEvent = (
  eventId,
) => {
  return EventVolunteer.countDocuments({
    event: eventId,
    status: "ACTIVE",
  }).exec();
};

/**
 * ============================================================
 * Get Events By Volunteer
 * ============================================================
 */

const getActiveByVolunteer = (
  volunteerId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return EventVolunteer.find({
    volunteer: volunteerId,
    status: "ACTIVE",
  })
    .populate(volunteerPopulate)
    .sort({
      assignedAt: -1,
    })
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Active Events By Volunteer
 * ============================================================
 */

const countActiveByVolunteer = (
  volunteerId,
) => {
  return EventVolunteer.countDocuments({
    volunteer: volunteerId,
    status: "ACTIVE",
  }).exec();
};

/**
 * ============================================================
 * Get All Assignments By Event
 * ============================================================
 *
 * Includes both ACTIVE and REMOVED assignments.
 *
 * Useful for administrative audit/history.
 */

const getAllByEvent = (
  eventId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return EventVolunteer.find({
    event: eventId,
  })
    .populate(volunteerPopulate)
    .sort({
      createdAt: -1,
    })
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count All Assignments By Event
 * ============================================================
 */

const countAllByEvent = (
  eventId,
) => {
  return EventVolunteer.countDocuments({
    event: eventId,
  }).exec();
};

/**
 * ============================================================
 * Find Existing Assignment
 * ============================================================
 *
 * Searches regardless of status.
 *
 * This is important when reassigning a volunteer whose previous
 * assignment was REMOVED.
 */

const findExistingAssignment = (
  eventId,
  volunteerId,
) => {
  return EventVolunteer.findOne({
    event: eventId,
    volunteer: volunteerId,
  })
    .sort({
      createdAt: -1,
    })
    .exec();
};

/**
 * ============================================================
 * Update Assignment
 * ============================================================
 */

const updateById = (
  assignmentId,
  updateData,
  options = {},
) => {
  return EventVolunteer.findByIdAndUpdate(
    assignmentId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(volunteerPopulate)
    .exec();
};

/**
 * ============================================================
 * Remove Assignment
 * ============================================================
 *
 * Soft-removes an assignment so that historical information
 * remains available.
 */

const removeAssignment = (
  assignmentId,
  removedBy,
  options = {},
) => {
  return EventVolunteer.findByIdAndUpdate(
    assignmentId,
    {
      status: "REMOVED",
      removedAt: new Date(),
      removedBy,
    },
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(volunteerPopulate)
    .exec();
};

/**
 * ============================================================
 * Restore Assignment
 * ============================================================
 *
 * Reactivates a previously removed assignment.
 */

const restoreAssignment = (
  assignmentId,
  options = {},
) => {
  return EventVolunteer.findByIdAndUpdate(
    assignmentId,
    {
      status: "ACTIVE",
      assignedAt: new Date(),
      removedAt: null,
      removedBy: null,
    },
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(volunteerPopulate)
    .exec();
};

/**
 * ============================================================
 * Delete Assignment
 * ============================================================
 *
 * Permanent deletion is intentionally kept as a repository
 * operation for administrative cleanup.
 *
 * Normal application flow should use removeAssignment().
 */

const deleteById = (
  assignmentId,
  options = {},
) => {
  return EventVolunteer.findByIdAndDelete(
    assignmentId,
    options,
  ).exec();
};

/**
 * ============================================================
 * Repository Export
 * ============================================================
 */

const eventVolunteerRepository =
  Object.freeze({
    create,

    findById,
    findByIdRaw,

    findActiveAssignment,
    assignmentExists,

    getActiveByEvent,
    countActiveByEvent,

    getActiveByVolunteer,
    countActiveByVolunteer,

    getAllByEvent,
    countAllByEvent,

    findExistingAssignment,

    updateById,

    removeAssignment,
    restoreAssignment,

    deleteById,
  });

export default eventVolunteerRepository;