import eventRepository from "../repositories/event.repository.js";

import {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EVENT_REGISTRATION_MODES,
} from "../constants/event.constants.js";

import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Helpers
 * ============================================================
 */

const normalizeCategory = (category) => {
  if (typeof category !== "string") {
    return category;
  }

  return category.trim().toUpperCase();
};

const normalizeType = (type) => {
  if (typeof type !== "string") {
    return type;
  }

  return type.trim().toUpperCase();
};

const normalizeRegistrationMode = (
  registrationMode,
) => {
  if (
    typeof registrationMode !==
    "string"
  ) {
    return registrationMode;
  }

  return registrationMode
    .trim()
    .toUpperCase();
};

/**
 * ============================================================
 * Apply Registration Configuration
 * ============================================================
 *
 * Keeps registrationMode, registrationRequired, isPaid and
 * registrationFee consistent.
 *
 * NONE
 *   No online registration.
 *
 * FREE
 *   Online registration without payment.
 *
 * PAID
 *   Online registration with payment.
 */

const applyRegistrationConfiguration = (
  eventData,
) => {
  const data = {
    ...eventData,
  };

  const mode =
    normalizeRegistrationMode(
      data.registrationMode ||
        EVENT_REGISTRATION_MODES.PAID,
    );

  data.registrationMode = mode;

  switch (mode) {
    case EVENT_REGISTRATION_MODES.NONE:
      data.registrationRequired = false;
      data.registrationOpen = false;
      data.isPaid = false;
      data.registrationFee = 0;
      data.maxParticipants =
        data.maxParticipants ?? null;
      break;

    case EVENT_REGISTRATION_MODES.FREE:
      data.registrationRequired = true;
      data.registrationOpen =
        data.registrationOpen ?? false;
      data.isPaid = false;
      data.registrationFee = 0;
      break;

    case EVENT_REGISTRATION_MODES.PAID:
      data.registrationRequired = true;
      data.registrationOpen =
        data.registrationOpen ?? false;
      data.isPaid = true;

      if (
        data.registrationFee ===
          undefined ||
        data.registrationFee ===
          null
      ) {
        throw new ApiError(
          "Registration fee is required for paid events.",
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      if (
        Number(data.registrationFee) <=
        0
      ) {
        throw new ApiError(
          "Registration fee must be greater than zero for paid events.",
          HTTP_STATUS.BAD_REQUEST,
        );
      }

      data.registrationFee = Number(
        data.registrationFee,
      );

      break;

    default:
      throw new ApiError(
        "Invalid event registration mode.",
        HTTP_STATUS.BAD_REQUEST,
      );
  }

  /**
   * Team / Individual configuration.
   */

  const type = normalizeType(
    data.type,
  );

  if (type === EVENT_TYPES.INDIVIDUAL) {
    data.teamSize = null;
  }

  if (type === EVENT_TYPES.TEAM) {
    if (
      data.teamSize ===
        undefined ||
      data.teamSize === null ||
      Number(data.teamSize) < 1
    ) {
      throw new ApiError(
        "Team events must specify a valid team size.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    data.teamSize = Number(
      data.teamSize,
    );
  }

  /**
   * Category / type normalization.
   */

  if (data.category) {
    data.category =
      normalizeCategory(
        data.category,
      );
  }

  if (data.type) {
    data.type =
      normalizeType(data.type);
  }

  return data;
};

/**
 * ============================================================
 * Validate Event Dates
 * ============================================================
 */

const validateEventDates = (
  eventData,
) => {
  const {
    startDateTime,
    endDateTime,
    registrationDeadline,
  } = eventData;

  if (
    startDateTime &&
    endDateTime &&
    new Date(endDateTime) <=
      new Date(startDateTime)
  ) {
    throw new ApiError(
      "Event end time must be after the start time.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (
    registrationDeadline &&
    startDateTime &&
    new Date(registrationDeadline) >
      new Date(startDateTime)
  ) {
    throw new ApiError(
      "Registration deadline cannot be after the event start time.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

/**
 * ============================================================
 * Create Event
 * ============================================================
 */

const createEvent = async (
  eventData,
  userId,
) => {
  if (!userId) {
    throw new ApiError(
      "Authenticated user is required.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  if (!eventData) {
    throw new ApiError(
      "Event data is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const normalizedData =
    applyRegistrationConfiguration(
      eventData,
    );

  validateEventDates(
    normalizedData,
  );

  normalizedData.createdBy =
    userId;

  const event =
    await eventRepository.create(
      normalizedData,
    );

  return eventRepository.findById(
    event._id,
  );
};

/**
 * ============================================================
 * Get Event By ID
 * ============================================================
 */

const getEventById = async (
  eventId,
) => {
  const event =
    await eventRepository.findById(
      eventId,
    );

  if (!event) {
    throw new ApiError(
      "Event not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  return event;
};

/**
 * ============================================================
 * Get All Events
 * ============================================================
 */

const getAllEvents = async ({
  page = 1,
  limit = 10,
} = {}) => {
  const [events, total] =
    await Promise.all([
      eventRepository.findAll({
        page,
        limit,
      }),

      eventRepository.count(),
    ]);

  return {
    events,

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
 * Update Event
 * ============================================================
 */

const updateEvent = async (
  eventId,
  updateData,
) => {
  const existingEvent =
    await eventRepository.findByIdRaw(
      eventId,
    );

  if (!existingEvent) {
    throw new ApiError(
      "Event not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  /**
   * Merge existing values with update values before applying
   * registration business rules.
   */

  const mergedData = {
    ...existingEvent,
    ...updateData,
  };

  /**
   * Mongoose internal fields must not be passed back as
   * ordinary update properties.
   */

  delete mergedData._id;
  delete mergedData.id;
  delete mergedData.createdAt;
  delete mergedData.updatedAt;

  const normalizedData =
    applyRegistrationConfiguration(
      mergedData,
    );

  validateEventDates(
    normalizedData,
  );

  /**
   * createdBy must remain unchanged.
   */

  normalizedData.createdBy =
    existingEvent.createdBy;

  const event =
    await eventRepository.updateById(
      eventId,
      normalizedData,
    );

  if (!event) {
    throw new ApiError(
      "Event could not be updated.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  return event;
};

/**
 * ============================================================
 * Delete Event
 * ============================================================
 */

const deleteEvent = async (
  eventId,
) => {
  const existingEvent =
    await eventRepository.findByIdRaw(
      eventId,
    );

  if (!existingEvent) {
    throw new ApiError(
      "Event not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  await eventRepository.deleteById(
    eventId,
  );

  return {
    message:
      "Event deleted successfully.",
  };
};

/**
 * ============================================================
 * Get Events By Festival
 * ============================================================
 */

const getEventsByFestival =
  async (
    festivalId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    const [events, total] =
      await Promise.all([
        eventRepository.getEventsByFestival(
          festivalId,
          {
            page,
            limit,
          },
        ),

        eventRepository.countByFestival(
          festivalId,
        ),
      ]);

    return {
      events,

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
 * Get Events By Category
 * ============================================================
 */

const getEventsByCategory =
  async (
    category,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    const normalizedCategory =
      normalizeCategory(
        category,
      );

    if (
      !Object.values(
        EVENT_CATEGORIES,
      ).includes(
        normalizedCategory,
      )
    ) {
      throw new ApiError(
        "Invalid event category.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const events =
      await eventRepository.getEventsByCategory(
        normalizedCategory,
        {
          page,
          limit,
        },
      );

    return {
      events,

      pagination: {
        page,
        limit,
      },
    };
  };

/**
 * ============================================================
 * Get Events By Type
 * ============================================================
 */

const getEventsByType =
  async (
    type,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    const normalizedType =
      normalizeType(type);

    if (
      !Object.values(
        EVENT_TYPES,
      ).includes(
        normalizedType,
      )
    ) {
      throw new ApiError(
        "Invalid event type.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const events =
      await eventRepository.getEventsByType(
        normalizedType,
        {
          page,
          limit,
        },
      );

    return {
      events,

      pagination: {
        page,
        limit,
      },
    };
  };

/**
 * ============================================================
 * Get Published Events
 * ============================================================
 */

const getPublishedEvents =
  async ({
    page = 1,
    limit = 10,
  } = {}) => {
    const events =
      await eventRepository.getPublishedEvents(
        {
          page,
          limit,
        },
      );

    return {
      events,

      pagination: {
        page,
        limit,
      },
    };
  };

/**
 * ============================================================
 * Get Open Registration Events
 * ============================================================
 *
 * Only events where online registration is actually required
 * and currently open are returned.
 *
 * NONE events are never returned here.
 */

const getOpenRegistrationEvents =
  async ({
    page = 1,
    limit = 10,
  } = {}) => {
    const events =
      await eventRepository.getOpenRegistrationEvents(
        {
          page,
          limit,
        },
      );

    return {
      events:
        events.filter(
          (event) =>
            event.registrationRequired ===
              true &&
            event.registrationMode !==
              EVENT_REGISTRATION_MODES.NONE,
        ),

      pagination: {
        page,
        limit,
      },
    };
  };

/**
 * ============================================================
 * Get Upcoming Events
 * ============================================================
 *
 * Events without a finalized schedule are not included here
 * because they do not yet have a meaningful startDateTime.
 */

const getUpcomingEvents =
  async ({
    page = 1,
    limit = 10,
  } = {}) => {
    const events =
      await eventRepository.getUpcomingEvents(
        {
          page,
          limit,
        },
      );

    return {
      events,

      pagination: {
        page,
        limit,
      },
    };
  };

/**
 * ============================================================
 * Search Events
 * ============================================================
 */

const searchEvents = async (
  searchTerm,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  if (
    typeof searchTerm !==
      "string" ||
    !searchTerm.trim()
  ) {
    throw new ApiError(
      "Search query is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const events =
    await eventRepository.searchEvents(
      searchTerm.trim(),
      {
        page,
        limit,
      },
    );

  return {
    events,

    pagination: {
      page,
      limit,
    },
  };
};

/**
 * ============================================================
 * Get Event Availability
 * ============================================================
 *
 * maxParticipants === null means unlimited.
 *
 * Actual registration counting is intentionally left to
 * the Registration module.
 */

const getEventAvailability =
  async (eventId) => {
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

    /**
     * Events without online registration do not have
     * registration capacity.
     */

    if (
      event.registrationMode ===
      EVENT_REGISTRATION_MODES.NONE
    ) {
      return {
        registrationRequired: false,
        registrationMode:
          EVENT_REGISTRATION_MODES.NONE,
        isPaid: false,
        registrationFee: 0,
        maxParticipants: null,
        registeredCount: 0,
        remaining: null,
        unlimited: true,
      };
    }

    /**
     * Capacity calculation will be connected to the
     * Registration/Team modules.
     */

    return {
      registrationRequired:
        event.registrationRequired,

      registrationMode:
        event.registrationMode,

      isPaid: event.isPaid,

      registrationFee:
        event.registrationFee,

      maxParticipants:
        event.maxParticipants,

      registeredCount: 0,

      remaining:
        event.maxParticipants ===
        null
          ? null
          : event.maxParticipants,

      unlimited:
        event.maxParticipants ===
        null,
    };
  };

/**
 * ============================================================
 * Export
 * ============================================================
 */

const eventService = Object.freeze({
  createEvent,

  getEventById,
  getAllEvents,

  updateEvent,
  deleteEvent,

  getEventsByFestival,
  getEventsByCategory,
  getEventsByType,

  getPublishedEvents,
  getOpenRegistrationEvents,
  getUpcomingEvents,

  searchEvents,

  getEventAvailability,
});

export default eventService;