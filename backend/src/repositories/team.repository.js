import Team from "../models/team.model.js";

/**
 * ============================================================
 * Population Configuration
 * ============================================================
 */

const teamPopulate = [
  {
    path: "leader",
    select:
      "fullName email collegeId role",
  },

  {
    path: "event",
    select:
      "title category type startDateTime endDateTime isPaid registrationFee currency teamSize maxParticipants",
  },

  {
    path: "festival",
    select:
      "title status",
  },

  {
    path: "members.user",
    select:
      "fullName email collegeId role",
  },
];

/**
 * ============================================================
 * Create Team
 * ============================================================
 */

const create = (
  teamData,
  options = {},
) => {
  return Team.create(
    [teamData],
    options,
  ).then(
    ([team]) => team,
  );
};

/**
 * ============================================================
 * Find Team By ID
 * ============================================================
 *
 * Returns populated lean object.
 */

const findById = (
  teamId,
) => {
  return Team.findById(teamId)
    .populate(teamPopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Team Document By ID
 * ============================================================
 *
 * Returns an actual Mongoose document.
 *
 * Used when the service needs:
 *
 * - save()
 * - modifying members
 * - changing leader
 * - changing status
 */

const findDocumentById = (
  teamId,
) => {
  return Team.findById(
    teamId,
  ).exec();
};

/**
 * ============================================================
 * Find All Teams
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
  return Team.find(filter)
    .populate(teamPopulate)
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
 * Count Teams
 * ============================================================
 */

const count = (
  filter = {},
) => {
  return Team.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Update Team By ID
 * ============================================================
 */

const updateById = (
  teamId,
  updateData,
  options = {},
) => {
  return Team.findByIdAndUpdate(
    teamId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(teamPopulate)
    .exec();
};

/**
 * ============================================================
 * Delete Team By ID
 * ============================================================
 */

const deleteById = (
  teamId,
) => {
  return Team.findByIdAndDelete(
    teamId,
  ).exec();
};

/**
 * ============================================================
 * Find Team By Invite Code
 * ============================================================
 */

const findByInviteCode = (
  inviteCode,
) => {
  return Team.findOne({
    inviteCode:
      inviteCode
        .trim()
        .toUpperCase(),
  })
    .populate(teamPopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Team By Invite Code - Raw
 * ============================================================
 */

const findDocumentByInviteCode = (
  inviteCode,
) => {
  return Team.findOne({
    inviteCode:
      inviteCode
        .trim()
        .toUpperCase(),
  }).exec();
};

/**
 * ============================================================
 * Find Teams By Leader
 * ============================================================
 */

const findByLeader = (
  leaderId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Team.find({
    leader: leaderId,
  })
    .populate(teamPopulate)
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
 * Find Teams By Event
 * ============================================================
 */

const findByEvent = (
  eventId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Team.find({
    event: eventId,
  })
    .populate(teamPopulate)
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
 * Find Teams By Festival
 * ============================================================
 */

const findByFestival = (
  festivalId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Team.find({
    festival: festivalId,
  })
    .populate(teamPopulate)
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
 * Find Teams Where User Is A Member
 * ============================================================
 */

const findByMember = (
  userId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Team.find({
    "members.user": userId,
  })
    .populate(teamPopulate)
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
 * Find Team By Event And Leader
 * ============================================================
 */

const findByEventAndLeader = (
  eventId,
  leaderId,
) => {
  return Team.findOne({
    event: eventId,
    leader: leaderId,
  })
    .populate(teamPopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Team By Event And Name
 * ============================================================
 *
 * Used to prevent duplicate team names within
 * the same event.
 */

const findByEventAndName = (
  eventId,
  teamName,
) => {
  return Team.findOne({
    event: eventId,
    teamName:
      teamName.trim(),
  })
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Team Where User Is Member For Event
 * ============================================================
 *
 * This is one of the most important methods.
 *
 * It prevents:
 *
 * Event A
 * ├── Team 1 → Naveen
 * └── Team 2 → Naveen ❌
 *
 * The service will use this before allowing
 * a user to create/join another team.
 */

const findByEventAndMember = (
  eventId,
  userId,
) => {
  return Team.findOne({
    event: eventId,
    "members.user": userId,
  })
    .populate(teamPopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Active Team Where User Is Member For Event
 * ============================================================
 */

const findActiveTeamByEventAndMember =
  (
    eventId,
    userId,
    activeStatuses,
  ) => {
    return Team.findOne({
      event: eventId,

      "members.user": userId,

      ...(Array.isArray(
        activeStatuses,
      ) &&
      activeStatuses.length > 0
        ? {
            status: {
              $in: activeStatuses,
            },
          }
        : {}),
    })
      .populate(teamPopulate)
      .lean()
      .exec();
  };

/**
 * ============================================================
 * Check Whether Invite Code Exists
 * ============================================================
 */

const inviteCodeExists = (
  inviteCode,
) => {
  return Team.exists({
    inviteCode:
      inviteCode
        .trim()
        .toUpperCase(),
  }).then(Boolean);
};

/**
 * ============================================================
 * Count Teams In An Event
 * ============================================================
 */

const countByEvent = (
  eventId,
) => {
  return Team.countDocuments({
    event: eventId,
  }).exec();
};

/**
 * ============================================================
 * Count Members In Team
 * ============================================================
 */

const countMembers = (
  teamId,
) => {
  return Team.aggregate([
    {
      $match: {
        _id: teamId,
      },
    },

    {
      $project: {
        memberCount: {
          $size: "$members",
        },
      },
    },
  ]);
};

/**
 * ============================================================
 * Repository Export
 * ============================================================
 */

const teamRepository =
  Object.freeze({
    create,
    findById,
    findDocumentById,
    findAll,
    count,
    updateById,
    deleteById,

    findByInviteCode,
    findDocumentByInviteCode,

    findByLeader,
    findByEvent,
    findByFestival,
    findByMember,

    findByEventAndLeader,
    findByEventAndName,
    findByEventAndMember,
    findActiveTeamByEventAndMember,

    inviteCodeExists,

    countByEvent,
    countMembers,
  });

export default teamRepository;