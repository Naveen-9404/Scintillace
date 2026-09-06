import {
  body,
  param,
  query,
} from "express-validator";

import {
  ACCOMMODATION_HOSTEL_TYPES,
} from "../constants/accommodation.constants.js";

/**
 * ============================================================
 * Create Accommodation Booking
 * ============================================================
 *
 * Participant selects:
 *
 * - Registration
 * - Boys Hostel / Girls Hostel
 * - Check-in date
 * - Check-out date
 *
 * Amount and currency are controlled by the backend.
 */

export const createAccommodationValidator = [
  body("registrationId")
    .trim()
    .notEmpty()
    .withMessage(
      "Registration ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Registration ID.",
    ),

  body("hostelType")
    .trim()
    .notEmpty()
    .withMessage(
      "Hostel type is required.",
    )
    .isIn(
      Object.values(
        ACCOMMODATION_HOSTEL_TYPES,
      ),
    )
    .withMessage(
      "Invalid accommodation hostel type.",
    ),

  body("checkInDate")
    .notEmpty()
    .withMessage(
      "Check-in date is required.",
    )
    .isISO8601()
    .withMessage(
      "Invalid check-in date.",
    ),

  body("checkOutDate")
    .notEmpty()
    .withMessage(
      "Check-out date is required.",
    )
    .isISO8601()
    .withMessage(
      "Invalid check-out date.",
    ),

  body("remarks")
    .optional()
    .trim()
    .isLength({
      max: 1000,
    })
    .withMessage(
      "Remarks cannot exceed 1000 characters.",
    ),
];

/**
 * ============================================================
 * Create Guest Accommodation Booking
 * ============================================================
 */

export const createGuestAccommodationValidator = [
  body("participantName")
    .trim()
    .notEmpty()
    .withMessage("Participant name is required.")
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters."),

  body("participantEmail")
    .trim()
    .notEmpty()
    .withMessage("Participant email is required.")
    .isEmail()
    .withMessage("Invalid email address."),

  body("participantPhone")
    .trim()
    .notEmpty()
    .withMessage("Participant phone is required.")
    .isLength({ max: 20 })
    .withMessage("Phone cannot exceed 20 characters."),

  body("collegeId")
    .trim()
    .notEmpty()
    .withMessage("College/Institution is required.")
    .isLength({ max: 200 })
    .withMessage("College name cannot exceed 200 characters."),

  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required.")
    .isLength({ max: 100 })
    .withMessage("Department cannot exceed 100 characters."),

  body("yearOfStudy")
    .trim()
    .notEmpty()
    .withMessage("Year of study is required.")
    .isLength({ max: 50 })
    .withMessage("Year of study cannot exceed 50 characters."),

  body("hostelType")
    .trim()
    .notEmpty()
    .withMessage("Hostel type is required.")
    .isIn(Object.values(ACCOMMODATION_HOSTEL_TYPES))
    .withMessage("Invalid accommodation hostel type."),

  body("checkInDate")
    .notEmpty()
    .withMessage("Check-in date is required.")
    .isISO8601()
    .withMessage("Invalid check-in date."),

  body("checkOutDate")
    .notEmpty()
    .withMessage("Check-out date is required.")
    .isISO8601()
    .withMessage("Invalid check-out date."),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Remarks cannot exceed 1000 characters."),
];

/**
 * ============================================================
 * Accommodation ID
 * ============================================================
 */

export const accommodationIdValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage(
      "Accommodation ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Accommodation ID.",
    ),
];

/**
 * ============================================================
 * Event ID / Accommodation Summary
 * ============================================================
 *
 * Optional hostelType allows administrators to
 * filter accommodation counts by hostel.
 */

export const accommodationEventIdValidator = [
  param("eventId")
    .trim()
    .notEmpty()
    .withMessage(
      "Event ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  query("hostelType")
    .optional()
    .trim()
    .isIn(
      Object.values(
        ACCOMMODATION_HOSTEL_TYPES,
      ),
    )
    .withMessage(
      "Invalid accommodation hostel type.",
    ),
];

/**
 * ============================================================
 * Pagination / Query
 * ============================================================
 *
 * Used by accommodation listing and
 * administrative filtering.
 */

export const accommodationQueryValidator = [
  query("page")
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage(
      "Page must be greater than or equal to 1.",
    ),

  query("limit")
    .optional()
    .isInt({
      min: 1,
      max: 100,
    })
    .withMessage(
      "Limit must be between 1 and 100.",
    ),

  query("hostelType")
    .optional()
    .trim()
    .isIn(
      Object.values(
        ACCOMMODATION_HOSTEL_TYPES,
      ),
    )
    .withMessage(
      "Invalid accommodation hostel type.",
    ),
];

/**
 * ============================================================
 * Confirm Accommodation
 * ============================================================
 */

export const confirmAccommodationValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage(
      "Accommodation ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Accommodation ID.",
    ),
];

/**
 * ============================================================
 * Payment
 * ============================================================
 */

export const paymentAccommodationValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage(
      "Accommodation ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Accommodation ID.",
    ),

  body("paymentId")
    .optional()
    .trim()
    .isLength({
      max: 200,
    })
    .withMessage(
      "Invalid payment ID.",
    ),
];

/**
 * ============================================================
 * Cancellation
 * ============================================================
 */

export const cancelAccommodationValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage(
      "Accommodation ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Accommodation ID.",
    ),

  body("reason")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Cancellation reason cannot exceed 500 characters.",
    ),
];

/**
 * ============================================================
 * Refund
 * ============================================================
 */

export const refundAccommodationValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage(
      "Accommodation ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Accommodation ID.",
    ),

  body("refundId")
    .optional()
    .trim()
    .isLength({
      max: 200,
    })
    .withMessage(
      "Invalid refund ID.",
    ),
];

/**
 * ============================================================
 * Rejection
 * ============================================================
 */

export const rejectAccommodationValidator = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage(
      "Accommodation ID is required.",
    )
    .isMongoId()
    .withMessage(
      "Invalid Accommodation ID.",
    ),

  body("reason")
    .optional()
    .trim()
    .isLength({
      max: 500,
    })
    .withMessage(
      "Rejection reason cannot exceed 500 characters.",
    ),
];