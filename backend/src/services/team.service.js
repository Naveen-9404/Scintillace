import mongoose from "mongoose";

import teamRepository from "../repositories/team.repository.js";
import eventRepository from "../repositories/event.repository.js";
import User from "../models/User.js";

import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

import {
  TEAM_STATUS,
  TEAM_MEMBER_ROLE,
} from "../constants/team.constants.js";

import {
  EVENT_TYPES,
  EVENT_STATUS,
} from "../constants/event.constants.js";

/**
 * ============================================================
 * Constants
 * ============================================================
 */

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * ============================================================
 * Helpers
 * ============================================================
 */

/**
 * Validate MongoDB ObjectId.
 */
const assertValidObjectId = (
  id,
  fieldName = "ID",
) => {
  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    throw new ApiError(
      `Invalid ${fieldName}.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

/**
 * Normalize pagination.
 */
const normalizePagination = (
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
) => {
  const normalizedPage = Number(page);
  const normalizedLimit = Number(limit);

  return {
    page:
      Number.isInteger(
        normalizedPage,
      ) &&
      normalizedPage >= 1
        ? normalizedPage
        : DEFAULT_PAGE,

    limit:
      Number.isInteger(
        normalizedLimit,
      ) &&
      normalizedLimit >= 1
        ? Math.min(
            normalizedLimit,
            MAX_LIMIT,
          )
        : DEFAULT_LIMIT,
  };
};

/**
 * Normalize invite code.
 */
const normalizeInviteCode = (
  inviteCode,
) => {
  if (
    !inviteCode ||
    typeof inviteCode !== "string"
  ) {
    throw new ApiError(
      "Invite code is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return inviteCode
    .trim()
    .toUpperCase();
};

/**
 * Normalize team name.
 */
const normalizeTeamName = (
  teamName,
) => {
  if (
    !teamName ||
    typeof teamName !== "string"
  ) {
    throw new ApiError(
      "Team name is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const normalized =
    teamName.trim();

  if (
    normalized.length < 3 ||
    normalized.length > 50
  ) {
    throw new ApiError(
      "Team name must be between 3 and 50 characters.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return normalized;
};

/**
 * Check whether event registration is currently
 * available for team operations.
 */
const assertTeamRegistrationAvailable =
  (event) => {
    if (!event) {
      throw new ApiError(
        "Event not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      event.type !== EVENT_TYPES.TEAM
    ) {
      throw new ApiError(
        "This is not a team event.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      !event.registrationOpen
    ) {
      throw new ApiError(
        "Registration is closed for this event.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      event.status ===
        EVENT_STATUS.CANCELLED ||
      event.status ===
        EVENT_STATUS.COMPLETED
    ) {
      throw new ApiError(
        "Registration is not available for this event.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      event.registrationDeadline &&
      new Date(
        event.registrationDeadline,
      ) <= new Date()
    ) {
      throw new ApiError(
        "The registration deadline for this event has passed.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      !Number.isInteger(
        event.teamSize,
      ) ||
      event.teamSize < 2
    ) {
      throw new ApiError(
        "Invalid team size configured for this event.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }
  };

/**
 * Generate unique invite code.
 */
const generateInviteCode =
  async () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (
      let attempt = 0;
      attempt < 20;
      attempt += 1
    ) {
      const inviteCode =
        Array.from(
          {
            length: 8,
          },
          () =>
            characters.charAt(
              Math.floor(
                Math.random() *
                  characters.length,
              ),
            ),
        ).join("");

      const exists =
        await teamRepository.inviteCodeExists(
          inviteCode,
        );

      if (!exists) {
        return inviteCode;
      }
    }

    throw new ApiError(
      "Unable to generate a unique team invite code. Please try again.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  };

/**
 * ============================================================
 * Create Team
 * ============================================================
 */

const createTeam = async ({
  leaderId,
  eventId,
  teamName,
}) => {
  assertValidObjectId(
    leaderId,
    "leader ID",
  );

  assertValidObjectId(
    eventId,
    "event ID",
  );

  const normalizedTeamName =
    normalizeTeamName(
      teamName,
    );

  /**
   * Verify leader.
   */

  const leader =
    await User.findById(
      leaderId,
    ).exec();

  if (!leader) {
    throw new ApiError(
      "Leader not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  if (!leader.isActive) {
    throw new ApiError(
      "Leader account is inactive.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  /**
   * Use raw event document so festival remains
   * an ObjectId rather than a populated object.
   */

  const event =
    await eventRepository.findByIdRaw(
      eventId,
    );

  if (!event) {
    throw new ApiError(
      "Event not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  assertTeamRegistrationAvailable(
    event,
  );

  /**
   * A user can only belong to one team
   * for a particular event.
   */

  const existingMembership =
    await teamRepository.findByEventAndMember(
      eventId,
      leaderId,
    );

  if (existingMembership) {
    throw new ApiError(
      "You already belong to a team for this event.",
      HTTP_STATUS.CONFLICT,
    );
  }

  /**
   * Prevent duplicate team names.
   */

  const existingTeam =
    await teamRepository.findByEventAndName(
      eventId,
      normalizedTeamName,
    );

  if (existingTeam) {
    throw new ApiError(
      "Team name already exists for this event.",
      HTTP_STATUS.CONFLICT,
    );
  }

  /**
   * Event controls team size.
   */

  const maxMembers =
    event.teamSize;

  if (
    !Number.isInteger(
      maxMembers,
    ) ||
    maxMembers < 2
  ) {
    throw new ApiError(
      "Invalid team size configured for this event.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const inviteCode =
    await generateInviteCode();

  try {
    const team =
      await teamRepository.create({
        teamName:
          normalizedTeamName,

        leader: leaderId,

        event: eventId,

        festival:
          event.festival,

        inviteCode,

        maxMembers,

        status:
          TEAM_STATUS.ACTIVE,

        members: [
          {
            user: leaderId,
            role:
              TEAM_MEMBER_ROLE.LEADER,
          },
        ],
      });

    return teamRepository.findById(
      team._id,
    );
  } catch (error) {
    /**
     * MongoDB duplicate key.
     *
     * Could be caused by a concurrent team-name
     * or invite-code creation.
     */

    if (
      error?.code === 11000
    ) {
      throw new ApiError(
        "A team with this name or invite code already exists. Please try again.",
        HTTP_STATUS.CONFLICT,
      );
    }

    throw error;
  }
};

/**
 * ============================================================
 * Join Team
 * ============================================================
 */

const joinTeam = async ({
  inviteCode,
  userId,
}) => {
  assertValidObjectId(
    userId,
    "user ID",
  );

  const normalizedInviteCode =
    normalizeInviteCode(
      inviteCode,
    );

  /**
   * Verify user.
   */

  const user =
    await User.findById(
      userId,
    ).exec();

  if (!user) {
    throw new ApiError(
      "User not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  if (!user.isActive) {
    throw new ApiError(
      "User account is inactive.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  /**
   * Find team.
   */

  const team =
    await teamRepository.findByInviteCode(
      normalizedInviteCode,
    );

  if (!team) {
    throw new ApiError(
      "Invalid invite code.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  /**
   * Check team state.
   */

  if (
  team.members.length >=
  team.maxMembers
) {
  throw new ApiError(
    `Maximum team limit exceeded. This team already has ${team.maxMembers} members.`,
    HTTP_STATUS.BAD_REQUEST,
  );
}

if (
  team.status !==
  TEAM_STATUS.ACTIVE
) {
  throw new ApiError(
    "This team is not accepting new members.",
    HTTP_STATUS.BAD_REQUEST,
  );
}

  /**
   * Verify event.
   */

  const event =
    await eventRepository.findByIdRaw(
      team.event._id ??
        team.event,
    );

  if (!event) {
    throw new ApiError(
      "Event not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  assertTeamRegistrationAvailable(
    event,
  );

  /**
   * Check whether the user is already
   * a member of this exact team.
   */

  const alreadyMember =
    team.members.some(
      (member) => {
        const memberId =
          member.user?._id ??
          member.user;

        return (
          memberId.toString() ===
          userId.toString()
        );
      },
    );

  if (alreadyMember) {
    throw new ApiError(
      "You are already a member of this team.",
      HTTP_STATUS.CONFLICT,
    );
  }

  /**
   * Check whether user belongs to another
   * team for the same event.
   */

  const existingTeam =
    await teamRepository.findByEventAndMember(
      event._id,
      userId,
    );

  if (existingTeam) {
    throw new ApiError(
      "You already belong to another team for this event.",
      HTTP_STATUS.CONFLICT,
    );
  }

  /**
   * Check capacity.
   */

  if (
    team.members.length >=
    team.maxMembers
  ) {
    throw new ApiError(
      "Team is already full.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /**
   * Get actual Mongoose document.
   */

  const teamDocument =
    await teamRepository.findDocumentById(
      team._id,
    );

  if (!teamDocument) {
    throw new ApiError(
      "Team not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  /**
   * Re-check capacity after loading the
   * actual document.
   *
   * This protects against simple race conditions.
   */

  if (
    teamDocument.members.length >=
    teamDocument.maxMembers
  ) {
    throw new ApiError(
      "Team is already full.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /**
   * Re-check duplicate membership.
   */

  const memberAlreadyAdded =
    teamDocument.members.some(
      (member) =>
        member.user.toString() ===
        userId.toString(),
    );

  if (memberAlreadyAdded) {
    throw new ApiError(
      "You are already a member of this team.",
      HTTP_STATUS.CONFLICT,
    );
  }

  teamDocument.members.push({
    user: userId,
    role:
      TEAM_MEMBER_ROLE.MEMBER,
  });

  if (
    teamDocument.members.length >=
    teamDocument.maxMembers
  ) {
    teamDocument.status =
      TEAM_STATUS.FULL;
  }
await teamDocument.save();

  return teamRepository.findById(
    teamDocument._id,
  );
};

/**
 * ============================================================
 * Leave Team
 * ============================================================
 */

const leaveTeam = async ({
  teamId,
  userId,
}) => {
  assertValidObjectId(
    teamId,
    "team ID",
  );

  assertValidObjectId(
    userId,
    "user ID",
  );

  const team =
    await teamRepository.findById(
      teamId,
    );

  if (!team) {
    throw new ApiError(
      "Team not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const member =
    team.members.find(
      (memberItem) => {
        const memberId =
          memberItem.user?._id ??
          memberItem.user;

        return (
          memberId.toString() ===
          userId.toString()
        );
      },
    );

  if (!member) {
    throw new ApiError(
      "You are not a member of this team.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const leaderId =
    team.leader?._id ??
    team.leader;

  const isLeader =
    leaderId.toString() ===
    userId.toString();

  /**
   * Leader cannot leave while other
   * members remain.
   */

  if (isLeader) {
    if (
      team.members.length > 1
    ) {
      throw new ApiError(
        "Transfer leadership before leaving the team.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await teamRepository.deleteById(
      teamId,
    );

    return {
      success: true,
      message:
        "Team deleted successfully.",
    };
  }

  const teamDocument =
    await teamRepository.findDocumentById(
      teamId,
    );

  if (!teamDocument) {
    throw new ApiError(
      "Team not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  teamDocument.members =
    teamDocument.members.filter(
      (memberItem) =>
        memberItem.user.toString() !==
        userId.toString(),
    );

  /**
   * Re-open a full team when a member leaves.
   */

  if (
    teamDocument.status ===
      TEAM_STATUS.FULL &&
    teamDocument.members.length <
      teamDocument.maxMembers
  ) {
    teamDocument.status =
      TEAM_STATUS.ACTIVE;
  }

  await teamDocument.save();

  return teamRepository.findById(
    teamId,
  );
};

/**
 * ============================================================
 * Remove Team Member
 * ============================================================
 */

const removeMember = async ({
  teamId,
  leaderId,
  memberId,
}) => {
  assertValidObjectId(
    teamId,
    "team ID",
  );

  assertValidObjectId(
    leaderId,
    "leader ID",
  );

  assertValidObjectId(
    memberId,
    "member ID",
  );

  const team =
    await teamRepository.findById(
      teamId,
    );

  if (!team) {
    throw new ApiError(
      "Team not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const currentLeaderId =
    team.leader?._id ??
    team.leader;

  if (
    currentLeaderId.toString() !==
    leaderId.toString()
  ) {
    throw new ApiError(
      "Only the team leader can remove members.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  if (
    leaderId.toString() ===
    memberId.toString()
  ) {
    throw new ApiError(
      "Leader cannot remove themselves.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const memberExists =
    team.members.some(
      (member) => {
        const memberIdValue =
          member.user?._id ??
          member.user;

        return (
          memberIdValue.toString() ===
          memberId.toString()
        );
      },
    );

  if (!memberExists) {
    throw new ApiError(
      "Member not found in this team.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const teamDocument =
    await teamRepository.findDocumentById(
      teamId,
    );

  if (!teamDocument) {
    throw new ApiError(
      "Team not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  teamDocument.members =
    teamDocument.members.filter(
      (member) =>
        member.user.toString() !==
        memberId.toString(),
    );

  if (
    teamDocument.status ===
      TEAM_STATUS.FULL &&
    teamDocument.members.length <
      teamDocument.maxMembers
  ) {
    teamDocument.status =
      TEAM_STATUS.ACTIVE;
  }

  await teamDocument.save();

  return teamRepository.findById(
    teamId,
  );
};

/**
 * ============================================================
 * Transfer Team Leadership
 * ============================================================
 */

const transferLeadership =
  async ({
    teamId,
    currentLeaderId,
    newLeaderId,
  }) => {
    assertValidObjectId(
      teamId,
      "team ID",
    );

    assertValidObjectId(
      currentLeaderId,
      "current leader ID",
    );

    assertValidObjectId(
      newLeaderId,
      "new leader ID",
    );

    const team =
      await teamRepository.findById(
        teamId,
      );

    if (!team) {
      throw new ApiError(
        "Team not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const leaderId =
      team.leader?._id ??
      team.leader;

    if (
      leaderId.toString() !==
      currentLeaderId.toString()
    ) {
      throw new ApiError(
        "Only the current leader can transfer leadership.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const newLeader =
      team.members.find(
        (member) => {
          const memberId =
            member.user?._id ??
            member.user;

          return (
            memberId.toString() ===
            newLeaderId.toString()
          );
        },
      );

    if (!newLeader) {
      throw new ApiError(
        "Selected user is not a team member.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const teamDocument =
      await teamRepository.findDocumentById(
        teamId,
      );

    if (!teamDocument) {
      throw new ApiError(
        "Team not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    teamDocument.leader =
      newLeaderId;

    teamDocument.members.forEach(
      (member) => {
        if (
          member.user.toString() ===
          currentLeaderId.toString()
        ) {
          member.role =
            TEAM_MEMBER_ROLE.MEMBER;
        }

        if (
          member.user.toString() ===
          newLeaderId.toString()
        ) {
          member.role =
            TEAM_MEMBER_ROLE.LEADER;
        }
      },
    );

    await teamDocument.save();

    return teamRepository.findById(
      teamId,
    );
  };

/**
 * ============================================================
 * Delete / Disband Team
 * ============================================================
 */

const deleteTeam = async ({
  teamId,
  userId,
  isAdmin = false,
}) => {
  assertValidObjectId(
    teamId,
    "team ID",
  );

  assertValidObjectId(
    userId,
    "user ID",
  );

  const team =
    await teamRepository.findById(
      teamId,
    );

  if (!team) {
    throw new ApiError(
      "Team not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const leaderId =
    team.leader?._id ??
    team.leader;

  const isLeader =
    leaderId.toString() ===
    userId.toString();

  if (
    !isLeader &&
    !isAdmin
  ) {
    throw new ApiError(
      "You are not authorized to delete this team.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  /**
   * Use status instead of physically deleting
   * the team for normal disbanding.
   *
   * This becomes important once Registration
   * is connected.
   */

  const updatedTeam =
    await teamRepository.updateById(
      teamId,
      {
        status:
          TEAM_STATUS.DISBANDED,
      },
    );

  if (!updatedTeam) {
    throw new ApiError(
      "Team not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  return updatedTeam;
};

/**
 * ============================================================
 * Update Team Status
 * ============================================================
 */

const updateTeamStatus = async ({
  teamId,
  status,
}) => {
  assertValidObjectId(
    teamId,
    "team ID",
  );

  if (
    !Object.values(
      TEAM_STATUS,
    ).includes(status)
  ) {
    throw new ApiError(
      "Invalid team status.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const team =
    await teamRepository.findById(
      teamId,
    );

  if (!team) {
    throw new ApiError(
      "Team not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  /**
   * Don't manually set ACTIVE when team is full.
   */

  if (
    status === TEAM_STATUS.ACTIVE &&
    team.members.length >=
      team.maxMembers
  ) {
    throw new ApiError(
      "A full team cannot be marked as active.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /**
   * Don't mark a team FULL when it hasn't
   * reached capacity.
   */

  if (
    status === TEAM_STATUS.FULL &&
    team.members.length <
      team.maxMembers
  ) {
    throw new ApiError(
      "A team cannot be marked as full before reaching its maximum size.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const updatedTeam =
    await teamRepository.updateById(
      teamId,
      {
        status,
      },
    );

  return updatedTeam;
};

/**
 * ============================================================
 * Get Team By ID
 * ============================================================
 */

const getTeamById = async (
  teamId,
) => {
  assertValidObjectId(
    teamId,
    "team ID",
  );

  const team =
    await teamRepository.findById(
      teamId,
    );

  if (!team) {
    throw new ApiError(
      "Team not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  return team;
};

/**
 * ============================================================
 * Get Teams Created By Leader
 * ============================================================
 */

const getTeamsByLeader = async (
  leaderId,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
) => {
  assertValidObjectId(
    leaderId,
    "leader ID",
  );

  const pagination =
    normalizePagination(
      page,
      limit,
    );

  return teamRepository.findByLeader(
    leaderId,
    pagination,
  );
};

/**
 * ============================================================
 * Get Teams Of Logged-in User
 * ============================================================
 */

const getMyTeams = async (
  userId,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
) => {
  assertValidObjectId(
    userId,
    "user ID",
  );

  const pagination =
    normalizePagination(
      page,
      limit,
    );

  return teamRepository.findByMember(
    userId,
    pagination,
  );
};

/**
 * ============================================================
 * Get Teams By Event
 * ============================================================
 */

const getTeamsByEvent = async (
  eventId,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
) => {
  assertValidObjectId(
    eventId,
    "event ID",
  );

  const pagination =
    normalizePagination(
      page,
      limit,
    );

  return teamRepository.findByEvent(
    eventId,
    pagination,
  );
};

/**
 * ============================================================
 * Get Teams By Festival
 * ============================================================
 */

const getTeamsByFestival =
  async (
    festivalId,
    page = DEFAULT_PAGE,
    limit = DEFAULT_LIMIT,
  ) => {
    assertValidObjectId(
      festivalId,
      "festival ID",
    );

    const pagination =
      normalizePagination(
        page,
        limit,
      );

    return teamRepository.findByFestival(
      festivalId,
      pagination,
    );
  };

/**
 * ============================================================
 * Get All Teams
 * ============================================================
 */

const getAllTeams = async ({
  filter = {},
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  sort = {
    createdAt: -1,
  },
} = {}) => {
  const pagination =
    normalizePagination(
      page,
      limit,
    );

  const [
    teams,
    total,
  ] = await Promise.all([
    teamRepository.findAll({
      filter,
      ...pagination,
      sort,
    }),

    teamRepository.count(
      filter,
    ),
  ]);

  return {
    teams,

    pagination: {
      total,
      page:
        pagination.page,
      limit:
        pagination.limit,
      totalPages: Math.ceil(
        total /
          pagination.limit,
      ),
    },
  };
};

/**
 * ============================================================
 * Count Teams By Event
 * ============================================================
 */

const countTeamsByEvent =
  async (
    eventId,
  ) => {
    assertValidObjectId(
      eventId,
      "event ID",
    );

    return teamRepository.countByEvent(
      eventId,
    );
  };

/**
 * ============================================================
 * Service Export
 * ============================================================
 */

const teamService =
  Object.freeze({
    createTeam,
    joinTeam,
    leaveTeam,
    removeMember,
    transferLeadership,
    deleteTeam,
    updateTeamStatus,
    getTeamById,
    getTeamsByLeader,
    getMyTeams,
    getTeamsByEvent,
    getTeamsByFestival,
    getAllTeams,
    countTeamsByEvent,
  });

export default teamService;