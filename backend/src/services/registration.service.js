import mongoose from "mongoose";

import registrationRepository from "../repositories/registration.repository.js";
import eventRepository from "../repositories/event.repository.js";
import teamRepository from "../repositories/team.repository.js";

import User from "../models/User.js";

import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

import {
  REGISTRATION_STATUS,
  PAYMENT_STATUS,
} from "../constants/registration.constants.js";

import {
  EVENT_STATUS,
  EVENT_TYPES,
} from "../constants/event.constants.js";

import {
  TEAM_STATUS,
} from "../constants/team.constants.js";

/**
 * ============================================================
 * Helpers
 * ============================================================
 */

const assertValidObjectId = (
  value,
  fieldName,
) => {
  if (
    !value ||
    !mongoose.isValidObjectId(value)
  ) {
    throw new ApiError(
      `Invalid ${fieldName}.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

/**
 * ============================================================
 * Event Registration Availability
 * ============================================================
 */

const isEventRegistrationOpen = (
  event,
) => {
  if (!event) {
    return false;
  }

  if (
    event.registrationOpen !== true
  ) {
    return false;
  }

  if (
    event.status ===
      EVENT_STATUS.CANCELLED ||
    event.status ===
      EVENT_STATUS.COMPLETED
  ) {
    return false;
  }

  return (
    event.status ===
      EVENT_STATUS.REGISTRATION_OPEN ||
    event.status ===
      EVENT_STATUS.PUBLISHED
  );
};

/**
 * ============================================================
 * Festival ID Helper
 * ============================================================
 */

const getFestivalId = (
  event,
) => {
  if (!event?.festival) {
    throw new ApiError(
      "Event is not associated with a festival.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (
    typeof event.festival ===
    "object"
  ) {
    return event.festival._id;
  }

  return event.festival;
};

/**
 * ============================================================
 * Team Helpers
 * ============================================================
 */

const teamContainsUser = (
  team,
  userId,
) => {
  if (!team?.members) {
    return false;
  }

  return team.members.some(
    (member) =>
      member.user?.toString() ===
      userId.toString(),
  );
};

const getTeamMemberCount = (
  team,
) => {
  return Array.isArray(
    team?.members,
  )
    ? team.members.length
    : 0;
};

/**
 * ============================================================
 * Validate Event
 * ============================================================
 */

const validateEventForRegistration =
  async (eventId) => {
    assertValidObjectId(
      eventId,
      "Event ID",
    );

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

    if (
      !isEventRegistrationOpen(
        event,
      )
    ) {
      throw new ApiError(
        "Registration is not open for this event.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      event.registrationDeadline &&
      new Date() >
        new Date(
          event.registrationDeadline,
        )
    ) {
      throw new ApiError(
        "Registration deadline has passed.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      new Date() >=
      new Date(event.startDateTime)
    ) {
      throw new ApiError(
        "Registration is no longer available because the event has started.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return event;
  };

/**
 * ============================================================
 * Validate Individual Registration
 * ============================================================
 */

const validateIndividualRegistration =
  async (
    userId,
    event,
  ) => {
    const existingRegistration =
      await registrationRepository.findActiveByUserAndEvent(
        userId,
        event._id,
      );

    if (existingRegistration) {
      if (
        event.isPaid &&
        (
          existingRegistration.status ===
            REGISTRATION_STATUS.PENDING ||
          existingRegistration.paymentStatus ===
            PAYMENT_STATUS.PENDING ||
          existingRegistration.paymentStatus ===
            PAYMENT_STATUS.FAILED
        )
      ) {
        return {
          existingRegistration,
          participantCount: 1,
        };
      }

      throw new ApiError(
        "You are already registered for this event.",
        HTTP_STATUS.CONFLICT,
      );
    }

    return {
      existingRegistration: null,
      participantCount: 1,
    };
  };

/**
 * ============================================================
 * Validate Team Registration
 * ============================================================
 *
 * Team rules:
 *
 * Minimum members : 1
 * Maximum members : 3
 *
 * Registration is performed by the team leader.
 */

const validateTeamRegistration =
  async (
    userId,
    event,
    teamId,
  ) => {
    if (!teamId) {
      throw new ApiError(
        "Team ID is required for team events.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    assertValidObjectId(
      teamId,
      "Team ID",
    );

    const team =
      await teamRepository.findDocumentById(
        teamId,
      );

    if (!team) {
      throw new ApiError(
        "Team not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      team.event.toString() !==
      event._id.toString()
    ) {
      throw new ApiError(
        "This team does not belong to the selected event.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      team.status !==
      TEAM_STATUS.ACTIVE
    ) {
      throw new ApiError(
        "This team is not available for registration.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      team.leader.toString() !==
      userId.toString()
    ) {
      throw new ApiError(
        "Only the team leader can register the team for this event.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    if (
      !teamContainsUser(
        team,
        userId,
      )
    ) {
      throw new ApiError(
        "Team leader is not a member of this team.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const memberCount =
      getTeamMemberCount(team);

    if (memberCount < 1) {
      throw new ApiError(
        "A team must contain at least one member.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const configuredTeamSize =
      Number(event.teamSize);

    const maxTeamSize =
      Number.isFinite(
        configuredTeamSize,
      ) &&
      configuredTeamSize > 0
        ? Math.min(
            configuredTeamSize,
            3,
          )
        : 3;

    if (
      memberCount >
      maxTeamSize
    ) {
      throw new ApiError(
        `Team exceeds the maximum team size of ${maxTeamSize}.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const existingRegistration =
      await registrationRepository.findActiveByTeamAndEvent(
        teamId,
        event._id,
      );

    if (existingRegistration) {
      if (
        event.isPaid &&
        (
          existingRegistration.status ===
            REGISTRATION_STATUS.PENDING ||
          existingRegistration.paymentStatus ===
            PAYMENT_STATUS.PENDING ||
          existingRegistration.paymentStatus ===
            PAYMENT_STATUS.FAILED
        )
      ) {
        return {
          team,
          existingRegistration,
          participantCount:
            memberCount,
        };
      }

      throw new ApiError(
        "This team is already registered for this event.",
        HTTP_STATUS.CONFLICT,
      );
    }

    return {
      team,
      existingRegistration: null,
      participantCount:
        memberCount,
    };
  };

/**
 * ============================================================
 * Event Capacity
 * ============================================================
 */

const getRegisteredParticipantCount =
  async (eventId) => {
    const registrations =
      await registrationRepository.findByEvent(
        eventId,
        {
          page: 1,
          limit: 10000,
        },
      );

    return registrations.reduce(
      (total, registration) => {
        if (
          registration.status !==
            REGISTRATION_STATUS.PENDING &&
          registration.status !==
            REGISTRATION_STATUS.REGISTERED
        ) {
          return total;
        }

        if (
          registration.team?.members
            ?.length
        ) {
          return (
            total +
            registration.team
              .members.length
          );
        }

        return total + 1;
      },
      0,
    );
  };

/**
 * ============================================================
 * Register For Event
 * ============================================================
 */

const createRegistration =
  async (
    userId,
    eventId,
    teamId = null,
  ) => {
    assertValidObjectId(
      userId,
      "User ID",
    );

    const event =
      await validateEventForRegistration(
        eventId,
      );

    /**
     * ========================================================
     * Participant Name Snapshot
     * ========================================================
     *
     * Capture the user's current profile name at registration.
     *
     * This value is stored permanently with the registration
     * and later copied to the certificate.
     */

    const user =
      await User.findById(userId)
        .select("fullName")
        .lean();

    if (!user) {
      throw new ApiError(
        "User not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const participantName =
      user.fullName?.trim();

    if (!participantName) {
      throw new ApiError(
        "Please complete your profile name before registering.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    /**
     * ========================================================
     * Determine Registration Type
     * ========================================================
     */

    let team = null;
    let participantCount = 1;
    let existingRegistration = null;

    if (
      event.type ===
      EVENT_TYPES.TEAM
    ) {
      const teamResult =
        await validateTeamRegistration(
          userId,
          event,
          teamId,
        );

      team =
        teamResult.team;

      participantCount =
        teamResult.participantCount;

      existingRegistration =
        teamResult.existingRegistration;
    } else {
      if (teamId) {
        throw new ApiError(
          "Team registration is not allowed for an individual event.",
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      const result =
        await validateIndividualRegistration(
          userId,
          event,
        );

      participantCount =
        result.participantCount;

      existingRegistration =
        result.existingRegistration;
    }

    /**
     * ========================================================
     * Existing Pending Registration
     * ========================================================
     */

    if (
      existingRegistration
    ) {
      if (!event.isPaid) {
        return {
          paymentRequired: false,

          registration:
            existingRegistration,

          participantCount,
        };
      }

      return {
        paymentRequired: true,

        registration:
          existingRegistration,

        participantCount,

        amount:
          event.registrationFee,

        currency:
          event.currency ||
          "INR",

        isRetry: true,
      };
    }

    /**
     * ========================================================
     * Capacity Check
     * ========================================================
     */

    if (
      event.maxParticipants
    ) {
      const currentParticipants =
        await getRegisteredParticipantCount(
          event._id,
        );

      if (
        currentParticipants +
          participantCount >
        event.maxParticipants
      ) {
        throw new ApiError(
          "There are not enough available seats for this registration.",
          HTTP_STATUS.BAD_REQUEST,
        );
      }
    }

    /**
     * ========================================================
     * Registration Data
     * ========================================================
     */

    const registrationData = {
      user: userId,

      participantName,

      event: event._id,

      festival:
        getFestivalId(event),

      team: team
        ? team._id
        : null,

      status:
        event.isPaid
          ? REGISTRATION_STATUS.PENDING
          : REGISTRATION_STATUS.REGISTERED,

      paymentStatus:
        event.isPaid
          ? PAYMENT_STATUS.PENDING
          : PAYMENT_STATUS.NOT_REQUIRED,
    };

    /**
     * ========================================================
     * Create Registration
     * ========================================================
     */

    const registration =
      await registrationRepository.create(
        registrationData,
      );

    /**
     * ========================================================
     * FREE EVENT
     * ========================================================
     */

    if (!event.isPaid) {
      return {
        paymentRequired: false,

        registration,

        participantCount,
      };
    }

    /**
     * ========================================================
     * PAID EVENT
     * ========================================================
     */

    return {
      paymentRequired: true,

      registration,

      participantCount,

      amount:
        event.registrationFee,

      currency:
        event.currency ||
        "INR",

      isRetry: false,
    };
  };

/**
 * ============================================================
 * Get All Registrations
 * ============================================================
 */

const getAllRegistrations =
  async ({
    page = 1,
    limit = 10,
    filter = {},
  } = {}) => {
    const registrations =
      await registrationRepository.findAll({
        filter,
        page,
        limit,
      });

    const total =
      await registrationRepository.count(
        filter,
      );

    return {
      registrations,

      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(
            total / limit,
          ),
      },
    };
  };
  /**
 * ============================================================
 * Get Registration By ID
 * ============================================================
 */

const getRegistrationById =
  async (
    registrationId,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return registration;
  };

/**
 * ============================================================
 * Get My Registrations
 * ============================================================
 */

const getMyRegistrations =
  async (
    userId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    assertValidObjectId(
      userId,
      "User ID",
    );

    return registrationRepository.findByUser(
      userId,
      {
        page,
        limit,
      },
    );
  };

/**
 * ============================================================
 * Get Registrations By Event
 * ============================================================
 */

const getRegistrationsByEvent =
  async (
    eventId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    assertValidObjectId(
      eventId,
      "Event ID",
    );

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

    return registrationRepository.findByEvent(
      eventId,
      {
        page,
        limit,
      },
    );
  };

/**
 * ============================================================
 * Get Registrations By Festival
 * ============================================================
 */

const getRegistrationsByFestival =
  async (
    festivalId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    assertValidObjectId(
      festivalId,
      "Festival ID",
    );

    return registrationRepository.findByFestival(
      festivalId,
      {
        page,
        limit,
      },
    );
  };

/**
 * ============================================================
 * Get Registrations By Team
 * ============================================================
 */

const getRegistrationsByTeam =
  async (
    teamId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    assertValidObjectId(
      teamId,
      "Team ID",
    );

    const team =
      await teamRepository.findDocumentById(
        teamId,
      );

    if (!team) {
      throw new ApiError(
        "Team not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return registrationRepository.findByTeam(
      teamId,
      {
        page,
        limit,
      },
    );
  };

/**
 * ============================================================
 * Cancel Registration
 * ============================================================
 */

const cancelRegistration =
  async (
    registrationId,
    userId,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    assertValidObjectId(
      userId,
      "User ID",
    );

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const registrationUserId =
      registration.user?._id ??
      registration.user;

    if (
      registrationUserId
        .toString() !==
      userId.toString()
    ) {
      throw new ApiError(
        "You are not authorized to cancel this registration.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    if (
      registration.status ===
      REGISTRATION_STATUS.CANCELLED
    ) {
      throw new ApiError(
        "Registration is already cancelled.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      registration.checkedIn
    ) {
      throw new ApiError(
        "A checked-in registration cannot be cancelled.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      registration.paymentStatus ===
      PAYMENT_STATUS.PAID
    ) {
      throw new ApiError(
        "Paid registrations must be cancelled through the payment/refund process.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return registrationRepository.updateById(
      registrationId,
      {
        status:
          REGISTRATION_STATUS.CANCELLED,

        cancellationDate:
          new Date(),
      },
    );
  };

/**
 * ============================================================
 * Update Registration Status
 * ============================================================
 */

const updateRegistrationStatus =
  async (
    registrationId,
    status,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    if (
      !Object.values(
        REGISTRATION_STATUS,
      ).includes(status)
    ) {
      throw new ApiError(
        "Invalid registration status.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      registration.status ===
        REGISTRATION_STATUS.CANCELLED &&
      status !==
        REGISTRATION_STATUS.CANCELLED
    ) {
      throw new ApiError(
        "A cancelled registration cannot be reactivated.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return registrationRepository.updateById(
      registrationId,
      {
        status,
      },
    );
  };

/**
 * ============================================================
 * Update Payment Status
 * ============================================================
 */

const updatePaymentStatus =
  async (
    registrationId,
    paymentStatus,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    if (
      !Object.values(
        PAYMENT_STATUS,
      ).includes(
        paymentStatus,
      )
    ) {
      throw new ApiError(
        "Invalid payment status.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const updateData = {
      paymentStatus,
    };

    if (
      paymentStatus ===
      PAYMENT_STATUS.PAID
    ) {
      updateData.status =
        REGISTRATION_STATUS.REGISTERED;
    }

    if (
      paymentStatus ===
      PAYMENT_STATUS.FAILED
    ) {
      updateData.status =
        REGISTRATION_STATUS.PENDING;
    }

    if (
      paymentStatus ===
      PAYMENT_STATUS.REFUNDED
    ) {
      updateData.status =
        REGISTRATION_STATUS.CANCELLED;

      updateData.cancellationDate =
        new Date();
    }

    return registrationRepository.updateById(
      registrationId,
      updateData,
    );
  };

/**
 * ============================================================
 * Check In Registration
 * ============================================================
 */

const checkInRegistration =
  async (
    registrationId,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      registration.status !==
      REGISTRATION_STATUS.REGISTERED
    ) {
      throw new ApiError(
        "Only registered participants can be checked in.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      registration.checkedIn
    ) {
      throw new ApiError(
        "Participant is already checked in.",
        HTTP_STATUS.CONFLICT,
      );
    }

    return registrationRepository.updateById(
      registrationId,
      {
        checkedIn: true,
        checkedInAt: new Date(),
      },
    );
  };

/**
 * ============================================================
 * Delete Registration
 * ============================================================
 */

const deleteRegistration =
  async (
    registrationId,
  ) => {
    assertValidObjectId(
      registrationId,
      "Registration ID",
    );

    const registration =
      await registrationRepository.findById(
        registrationId,
      );

    if (!registration) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      registration.paymentStatus ===
        PAYMENT_STATUS.PAID ||
      registration.paymentStatus ===
        PAYMENT_STATUS.REFUNDED
    ) {
      throw new ApiError(
        "Paid registrations cannot be permanently deleted.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    await registrationRepository.deleteById(
      registrationId,
    );

    return {
      success: true,

      message:
        "Registration deleted successfully.",
    };
  };

/**
 * ============================================================
 * Service Export
 * ============================================================
 */

const registrationService =
  Object.freeze({
    createRegistration,

    getAllRegistrations,
    getRegistrationById,

    getMyRegistrations,
    getRegistrationsByEvent,
    getRegistrationsByFestival,
    getRegistrationsByTeam,

    cancelRegistration,

    updateRegistrationStatus,
    updatePaymentStatus,

    checkInRegistration,

    deleteRegistration,
  });

export default registrationService;