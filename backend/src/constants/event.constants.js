/**
 * ============================================================
 * Event Constants
 * ============================================================
 */

/**
 * Event categories supported by FestSphere.
 */

export const EVENT_CATEGORIES = Object.freeze({
  TECHNICAL: "TECHNICAL",
  CULTURAL: "CULTURAL",
  SPORTS: "SPORTS",
  LITERARY: "LITERARY",
  WORKSHOP: "WORKSHOP",
  SEMINAR: "SEMINAR",
  GAMING: "GAMING",
  OTHER: "OTHER",
});

/**
 * Event participation type.
 */

export const EVENT_TYPES = Object.freeze({
  INDIVIDUAL: "INDIVIDUAL",
  TEAM: "TEAM",
});

/**
 * Event status.
 */

export const EVENT_STATUS = Object.freeze({
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  REGISTRATION_OPEN: "REGISTRATION_OPEN",
  REGISTRATION_CLOSED: "REGISTRATION_CLOSED",
  ONGOING: "ONGOING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
});

/**
 * ============================================================
 * Event Registration Modes
 * ============================================================
 *
 * PAID:
 *     Registration is required and payment is required.
 *
 * FREE:
 *     Registration is required but no payment is required.
 *
 * NONE:
 *     No online registration is required.
 *
 * Example:
 *
 * Paper Presentation
 *     -> PAID
 *
 * Workshop
 *     -> PAID
 *
 * Technical Quiz
 *     -> NONE
 *
 * Spot Events
 *     -> NONE
 */

export const EVENT_REGISTRATION_MODES =
  Object.freeze({
    PAID: "PAID",
    FREE: "FREE",
    NONE: "NONE",
  });

export const EVENT_REGISTRATION_METHODS =
  Object.freeze({
    SYSTEM: "SYSTEM",
  });

/**
 * ============================================================
 * Export
 * ============================================================
 */

export default {
  EVENT_CATEGORIES,
  EVENT_TYPES,
  EVENT_STATUS,
  EVENT_REGISTRATION_MODES,
  EVENT_REGISTRATION_METHODS,
};