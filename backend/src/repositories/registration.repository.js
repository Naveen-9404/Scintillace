import Registration from "../models/Registration.js";

import {
  REGISTRATION_STATUS,
} from "../constants/registration.constants.js";

/**
 * ============================================================
 * Populate Configuration
 * ============================================================
 */

const registrationPopulate = [
  {
    path: "user",
    select:
      "fullName email phone collegeId role",
  },

  {
    path: "event",
    select:
      "title description category type venue startDateTime endDateTime registrationDeadline maxParticipants teamSize isPaid registrationFee currency status registrationOpen",
  },

  {
    path: "festival",
    select:
      "title status",
  },

  {
    path: "team",
    select:
      "teamName leader members maxMembers inviteCode status",
    populate: [
      {
        path: "leader",
        select:
          "fullName email collegeId role",
      },

      {
        path: "members.user",
        select:
          "fullName email collegeId role",
      },
    ],
  },
];

/**
 * ============================================================
 * Pagination Helper
 * ============================================================
 */

const getPagination = ({
  page = 1,
  limit = 10,
} = {}) => ({
  skip: (page - 1) * limit,
  limit,
});

/**
 * ============================================================
 * Create Registration
 * ============================================================
 */

const create = async (
  registrationData,
  session = null,
) => {
  const options = session
    ? { session }
    : {};

  const [registration] =
    await Registration.create(
      [registrationData],
      options,
    );

  return registration.populate(
    registrationPopulate,
  );
};

/**
 * ============================================================
 * Find Registration By ID
 * ============================================================
 */

const findById = (
  registrationId,
) => {
  return Registration.findById(
    registrationId,
  )
    .populate(
      registrationPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Find Registration Document By ID
 * ============================================================
 */

const findDocumentById = (
  registrationId,
) => {
  return Registration.findById(
    registrationId,
  ).exec();
};

/**
 * ============================================================
 * Find All Registrations
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
  const pagination =
    getPagination({
      page,
      limit,
    });

  return Registration.find(
    filter,
  )
    .populate(
      registrationPopulate,
    )
    .sort(sort)
    .skip(pagination.skip)
    .limit(pagination.limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Registrations
 * ============================================================
 */

const count = (
  filter = {},
) => {
  return Registration.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Find Registrations By User
 * ============================================================
 */

const findByUser = (
  userId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  const pagination =
    getPagination({
      page,
      limit,
    });

  return Registration.find({
    user: userId,
  })
    .populate(
      registrationPopulate,
    )
    .sort({
      createdAt: -1,
    })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Registrations By Event
 * ============================================================
 */

const findByEvent = (
  eventId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  const pagination =
    getPagination({
      page,
      limit,
    });

  return Registration.find({
    event: eventId,
  })
    .populate(
      registrationPopulate,
    )
    .sort({
      createdAt: -1,
    })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Registrations By Festival
 * ============================================================
 */

const findByFestival = (
  festivalId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  const pagination =
    getPagination({
      page,
      limit,
    });

  return Registration.find({
    festival: festivalId,
  })
    .populate(
      registrationPopulate,
    )
    .sort({
      createdAt: -1,
    })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Registrations By Team
 * ============================================================
 */

const findByTeam = (
  teamId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  const pagination =
    getPagination({
      page,
      limit,
    });

  return Registration.find({
    team: teamId,
  })
    .populate(
      registrationPopulate,
    )
    .sort({
      createdAt: -1,
    })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Registration By User And Event
 * ============================================================
 */

const findByUserAndEvent = (
  userId,
  eventId,
) => {
  return Registration.findOne({
    user: userId,
    event: eventId,
  })
    .populate(
      registrationPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Find Registration By Team And Event
 * ============================================================
 */

const findByTeamAndEvent = (
  teamId,
  eventId,
) => {
  return Registration.findOne({
    team: teamId,
    event: eventId,
  })
    .populate(
      registrationPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Find Registration By User And Event - Raw
 * ============================================================
 */

const findRawByUserAndEvent = (
  userId,
  eventId,
) => {
  return Registration.findOne({
    user: userId,
    event: eventId,
  }).exec();
};

/**
 * ============================================================
 * Find Registration By Team And Event - Raw
 * ============================================================
 */

const findRawByTeamAndEvent = (
  teamId,
  eventId,
) => {
  return Registration.findOne({
    team: teamId,
    event: eventId,
  }).exec();
};

/**
 * ============================================================
 * Update Registration By ID
 * ============================================================
 */

const updateById = (
  registrationId,
  updateData,
  session = null,
) => {
  return Registration.findByIdAndUpdate(
    registrationId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...(session
        ? { session }
        : {}),
    },
  )
    .populate(
      registrationPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Delete Registration By ID
 * ============================================================
 */

const deleteById = (
  registrationId,
  session = null,
) => {
  return Registration.findByIdAndDelete(
    registrationId,
    session
      ? { session }
      : {},
  ).exec();
};

/**
 * ============================================================
 * Count Active Registrations By Event
 * ============================================================
 */

const countByEvent = (
  eventId,
) => {
  return Registration.countDocuments({
    event: eventId,
    status: {
      $in: [
        REGISTRATION_STATUS.PENDING,
        REGISTRATION_STATUS.REGISTERED,
      ],
    },
  }).exec();
};

/**
 * ============================================================
 * Count Active Registrations By Team
 * ============================================================
 */

const countByTeam = (
  teamId,
) => {
  return Registration.countDocuments({
    team: teamId,
    status: {
      $in: [
        REGISTRATION_STATUS.PENDING,
        REGISTRATION_STATUS.REGISTERED,
      ],
    },
  }).exec();
};

/**
 * ============================================================
 * Count Active Registrations By User
 * ============================================================
 */

const countByUser = (
  userId,
) => {
  return Registration.countDocuments({
    user: userId,
    status: {
      $in: [
        REGISTRATION_STATUS.PENDING,
        REGISTRATION_STATUS.REGISTERED,
      ],
    },
  }).exec();
};

/**
 * ============================================================
 * Find Active Registration By User And Event
 * ============================================================
 */

const findActiveByUserAndEvent = (
  userId,
  eventId,
) => {
  return Registration.findOne({
    user: userId,
    event: eventId,
    status: {
      $ne:
        REGISTRATION_STATUS.CANCELLED,
    },
  })
    .populate(
      registrationPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Find Active Registration By Team And Event
 * ============================================================
 */

const findActiveByTeamAndEvent = (
  teamId,
  eventId,
) => {
  return Registration.findOne({
    team: teamId,
    event: eventId,
    status: {
      $ne:
        REGISTRATION_STATUS.CANCELLED,
    },
  })
    .populate(
      registrationPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Find Checked-In Registrations By Festival
 * ============================================================
 *
 * Certificate eligibility is determined here.
 *
 * A registration is eligible only when:
 *
 * 1. It belongs to the requested festival.
 * 2. checkedIn === true.
 * 3. It has not been cancelled.
 *
 * The certificate service should use this method instead of
 * querying Registration directly.
 */

const findCheckedInByFestival = (
  festivalId,
  {
    page = 1,
    limit = 100,
  } = {},
) => {
  const pagination =
    getPagination({
      page,
      limit,
    });

  return Registration.find({
    festival: festivalId,

    checkedIn: true,

    status: {
      $ne:
        REGISTRATION_STATUS.CANCELLED,
    },
  })
    .populate(
      registrationPopulate,
    )
    .sort({
      checkedInAt: 1,
      createdAt: 1,
    })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .exec();
};

/**
 * ============================================================
 * Count Checked-In Registrations By Festival
 * ============================================================
 */

const countCheckedInByFestival = (
  festivalId,
) => {
  return Registration.countDocuments({
    festival: festivalId,

    checkedIn: true,

    status: {
      $ne:
        REGISTRATION_STATUS.CANCELLED,
    },
  }).exec();
};

/**
 * ============================================================
 * Repository Export
 * ============================================================
 */

const registrationRepository =
  Object.freeze({
    create,

    findById,
    findDocumentById,

    findAll,
    count,

    findByUser,
    findByEvent,
    findByFestival,
    findByTeam,

    findByUserAndEvent,
    findByTeamAndEvent,

    findRawByUserAndEvent,
    findRawByTeamAndEvent,

    findActiveByUserAndEvent,
    findActiveByTeamAndEvent,

    findCheckedInByFestival,
    countCheckedInByFestival,

    updateById,
    deleteById,

    countByEvent,
    countByTeam,
    countByUser,
  });

export default registrationRepository;