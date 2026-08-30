import Event from "../models/Event.js";

/**
 * ============================================================
 * Event Population Configuration
 * ============================================================
 */

const eventPopulate = [
  {
    path: "festival",
    select: "title status",
  },

  {
    path: "createdBy",
    select: "fullName email role",
  },

  {
    path: "coordinators.user",
    select: "fullName email",
  },
];

/**
 * ============================================================
 * Create Event
 * ============================================================
 */

const create = async (
  eventData,
  options = {},
) => {
  const [event] =
    await Event.create(
      [eventData],
      options,
    );

  return event;
};

/**
 * ============================================================
 * Find Event By ID
 * ============================================================
 *
 * Returns a populated lean object.
 */

const findById = (
  eventId,
) => {
  return Event.findById(
    eventId,
  )
    .populate(eventPopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Event By ID - Raw
 * ============================================================
 *
 * Returns an unpopulated event.
 *
 * Important for service-layer business logic where
 * referenced fields must remain ObjectIds.
 */

const findByIdRaw = (
  eventId,
) => {
  return Event.findById(
    eventId,
  )
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find All Events
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
  return Event.find(
    filter,
  )
    .populate(eventPopulate)
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
 * Count Events
 * ============================================================
 */

const count = (
  filter = {},
) => {
  return Event.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Update Event By ID
 * ============================================================
 */

const updateById = (
  eventId,
  updateData,
  options = {},
) => {
  return Event.findByIdAndUpdate(
    eventId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(eventPopulate)
    .exec();
};

/**
 * Atomically reserve confirmed participant capacity. Unlimited events still
 * maintain the counter for reporting, while limited events reject increments
 * that would exceed maxParticipants.
 */
const reserveParticipantCapacity = (
  eventId,
  participantCount,
  session = null,
) => {
  return Event.findOneAndUpdate(
    {
      _id: eventId,
    },
    {
      $inc: {
        registeredParticipantCount:
          participantCount,
      },
    },
    {
      new: true,
      ...(session
        ? { session }
        : {}),
    },
  ).exec();
};

const releaseParticipantCapacity = (
  eventId,
  participantCount,
  session = null,
) => {
  return Event.findOneAndUpdate(
    {
      _id: eventId,
      registeredParticipantCount: {
        $gte: participantCount,
      },
    },
    {
      $inc: {
        registeredParticipantCount:
          -participantCount,
      },
    },
    {
      new: true,
      ...(session
        ? { session }
        : {}),
    },
  ).exec();
};

/**
 * ============================================================
 * Delete Event By ID
 * ============================================================
 */

const deleteById = (
  eventId,
  options = {},
) => {
  return Event.findByIdAndDelete(
    eventId,
    options,
  ).exec();
};

/**
 * ============================================================
 * Check Whether Event Exists
 * ============================================================
 */

const eventExists = (
  eventId,
) => {
  return Event.exists({
    _id: eventId,
  }).then(Boolean);
};

/**
 * ============================================================
 * Get Events By Festival
 * ============================================================
 */

const getEventsByFestival = (
  festivalId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Event.find({
    festival: festivalId,
  })
    .populate(eventPopulate)
    .sort({
      startDateTime: 1,
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
 * Get Events By Category
 * ============================================================
 */

const getEventsByCategory = (
  category,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Event.find({
    category,
  })
    .populate(eventPopulate)
    .sort({
      startDateTime: 1,
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
 * Get Events By Type
 * ============================================================
 */

const getEventsByType = (
  type,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Event.find({
    type,
  })
    .populate(eventPopulate)
    .sort({
      startDateTime: 1,
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
 * Get Published Events
 * ============================================================
 */

const getPublishedEvents = ({
  page = 1,
  limit = 10,
} = {}) => {
  return Event.find({
    status: "PUBLISHED",
  })
    .populate(eventPopulate)
    .sort({
      startDateTime: 1,
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
 * Get Events With Registration Open
 * ============================================================
 */

const getOpenRegistrationEvents = ({
  page = 1,
  limit = 10,
} = {}) => {
  return Event.find({
    registrationOpen: true,
  })
    .populate(eventPopulate)
    .sort({
      startDateTime: 1,
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
 * Get Upcoming Events
 * ============================================================
 */

const getUpcomingEvents = ({
  page = 1,
  limit = 10,
} = {}) => {
  return Event.find({
    startDateTime: {
      $gte: new Date(),
    },

    status: {
      $nin: [
        "CANCELLED",
        "COMPLETED",
      ],
    },
  })
    .populate(eventPopulate)
    .sort({
      startDateTime: 1,
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
 * Search Events
 * ============================================================
 */

const searchEvents = (
  searchTerm,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Event.find({
    $text: {
      $search: searchTerm,
    },
  })
    .populate(eventPopulate)
    .sort({
      score: {
        $meta: "textScore",
      },
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
 * Count Events By Festival
 * ============================================================
 */

const countByFestival = (
  festivalId,
) => {
  return Event.countDocuments({
    festival: festivalId,
  }).exec();
};

/**
 * ============================================================
 * Count Open Registration Events
 * ============================================================
 */

const countOpenRegistrationEvents =
  () => {
    return Event.countDocuments({
      registrationOpen: true,
    }).exec();
  };

/**
 * ============================================================
 * Repository Export
 * ============================================================
 */

const eventRepository =
  Object.freeze({
    create,

    findById,
    findByIdRaw,

    findAll,
    count,

    updateById,
    reserveParticipantCapacity,
    releaseParticipantCapacity,
    deleteById,

    eventExists,

    getEventsByFestival,
    getEventsByCategory,
    getEventsByType,

    getPublishedEvents,
    getOpenRegistrationEvents,
    getUpcomingEvents,

    searchEvents,

    countByFestival,
    countOpenRegistrationEvents,
  });

export default eventRepository;
