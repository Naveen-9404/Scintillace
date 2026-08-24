import Volunteer from "../models/Volunteer.js";

/**
 * ============================================================
 * Volunteer Population Configuration
 * ============================================================
 */

const volunteerPopulate = [
  {
    path: "user",
    select: "fullName email phone collegeId role",
  },

  {
    path: "festival",
    select: "title status startDate endDate",
  },

  {
    path: "event",
    select: "title status startDateTime endDateTime",
  },

  {
    path: "assignedBy",
    select: "fullName email role",
  },

  {
    path: "updatedBy",
    select: "fullName email role",
  },
];

/**
 * ============================================================
 * Create Volunteer Assignment
 * ============================================================
 */

const create = async (
  volunteerData,
  options = {},
) => {
  const [volunteer] =
    await Volunteer.create(
      [volunteerData],
      options,
    );

  return volunteer;
};

/**
 * ============================================================
 * Find Volunteer By ID
 * ============================================================
 */

const findById = (
  volunteerId,
) => {
  return Volunteer.findById(
    volunteerId,
  )
    .populate(volunteerPopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Volunteer By ID - Raw
 * ============================================================
 */

const findByIdRaw = (
  volunteerId,
) => {
  return Volunteer.findById(
    volunteerId,
  )
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Volunteer By User
 * ============================================================
 */

const findByUser = (
  userId,
) => {
  return Volunteer.find({
    user: userId,
  })
    .populate(volunteerPopulate)
    .sort({
      createdAt: -1,
    })
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find All Volunteers
 * ============================================================
 */

const findAll = ({
  filter = {},
  page = 1,
  limit = 10,
  sort = {
    createdAt: -1,
  },
} = {}) => {
  return Volunteer.find(filter)
    .populate(volunteerPopulate)
    .sort(sort)
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Volunteers
 * ============================================================
 */

const count = (
  filter = {},
) => {
  return Volunteer.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Update Volunteer
 * ============================================================
 */

const updateById = (
  volunteerId,
  updateData,
  options = {},
) => {
  return Volunteer.findByIdAndUpdate(
    volunteerId,
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
 * Delete Volunteer
 * ============================================================
 */

const deleteById = (
  volunteerId,
  options = {},
) => {
  return Volunteer.findByIdAndDelete(
    volunteerId,
    options,
  ).exec();
};

/**
 * ============================================================
 * Check Volunteer Exists
 * ============================================================
 */

const volunteerExists = (
  volunteerId,
) => {
  return Volunteer.exists({
    _id: volunteerId,
  }).then(Boolean);
};

/**
 * ============================================================
 * Find Volunteers By Festival
 * ============================================================
 */

const getByFestival = (
  festivalId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Volunteer.find({
    festival: festivalId,
  })
    .populate(volunteerPopulate)
    .sort({
      department: 1,
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
 * Count Volunteers By Festival
 * ============================================================
 */

const countByFestival = (
  festivalId,
) => {
  return Volunteer.countDocuments({
    festival: festivalId,
  }).exec();
};

/**
 * ============================================================
 * Find Volunteers By Event
 * ============================================================
 */

const getByEvent = (
  eventId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Volunteer.find({
    event: eventId,
  })
    .populate(volunteerPopulate)
    .sort({
      department: 1,
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
 * Count Volunteers By Event
 * ============================================================
 */

const countByEvent = (
  eventId,
) => {
  return Volunteer.countDocuments({
    event: eventId,
  }).exec();
};

/**
 * ============================================================
 * Find Volunteers By Status
 * ============================================================
 */

const getByStatus = (
  status,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Volunteer.find({
    status,
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
 * Find Active Volunteers
 * ============================================================
 */

const getActive = ({
  festivalId = null,
  eventId = null,
  page = 1,
  limit = 10,
} = {}) => {
  const filter = {
    status: "ACTIVE",
  };

  if (festivalId) {
    filter.festival = festivalId;
  }

  if (eventId) {
    filter.event = eventId;
  }

  return Volunteer.find(filter)
    .populate(volunteerPopulate)
    .sort({
      department: 1,
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
 * Check Duplicate Assignment
 * ============================================================
 */

const assignmentExists = ({
  user,
  festival = null,
  event = null,
} = {}) => {
  const filter = {
    user,
  };

  if (festival) {
    filter.festival = festival;
  }

  if (event) {
    filter.event = event;
  }

  return Volunteer.exists(
    filter,
  ).then(Boolean);
};

/**
 * ============================================================
 * Volunteer Repository Export
 * ============================================================
 */

const volunteerRepository =
  Object.freeze({
    create,

    findById,
    findByIdRaw,
    findByUser,

    findAll,
    count,

    updateById,
    deleteById,

    volunteerExists,

    getByFestival,
    countByFestival,

    getByEvent,
    countByEvent,

    getByStatus,
    getActive,

    assignmentExists,
  });

export default volunteerRepository;