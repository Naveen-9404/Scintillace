import {
  body,
  param,
  query,
} from "express-validator";

import {
  TEAM_STATUS,
} from "../constants/team.constants.js";

/**
 * ============================================================
 * Create Team
 * ============================================================
 */

export const createTeamValidator = [
  body("eventId")
    .trim()
    .notEmpty()
    .withMessage(
      "Event ID is required.",
    )
    .bail()
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),

  body("teamName")
    .trim()
    .notEmpty()
    .withMessage(
      "Team name is required.",
    )
    .bail()
    .isLength({
      min: 3,
      max: 50,
    })
    .withMessage(
      "Team name must be between 3 and 50 characters.",
    )
    .matches(
      /^[A-Za-z0-9 _-]+$/,
    )
    .withMessage(
      "Team name contains invalid characters.",
    ),
];

/**
 * ============================================================
 * Join Team
 * ============================================================
 */

export const joinTeamValidator = [
  body("inviteCode")
    .trim()
    .notEmpty()
    .withMessage(
      "Invite code is required.",
    )
    .bail()
    .isLength({
      min: 8,
      max: 8,
    })
    .withMessage(
      "Invite code must be exactly 8 characters.",
    )
    .matches(
      /^[A-Za-z0-9]+$/,
    )
    .withMessage(
      "Invite code must contain only letters and numbers.",
    )
    .toUpperCase(),
];

/**
 * ============================================================
 * Leave Team
 * ============================================================
 */

export const leaveTeamValidator = [
  param("teamId")
    .isMongoId()
    .withMessage(
      "Invalid Team ID.",
    ),
];

/**
 * ============================================================
 * Remove Member
 * ============================================================
 */

export const removeMemberValidator = [
  param("teamId")
    .isMongoId()
    .withMessage(
      "Invalid Team ID.",
    ),

  param("memberId")
    .isMongoId()
    .withMessage(
      "Invalid Member ID.",
    ),
];

/**
 * ============================================================
 * Transfer Leadership
 * ============================================================
 */

export const transferLeadershipValidator = [
  param("teamId")
    .isMongoId()
    .withMessage(
      "Invalid Team ID.",
    ),

  body("newLeaderId")
    .trim()
    .notEmpty()
    .withMessage(
      "New leader ID is required.",
    )
    .bail()
    .isMongoId()
    .withMessage(
      "Invalid New Leader ID.",
    ),
];

/**
 * ============================================================
 * Update Team Status
 * ============================================================
 */

export const updateTeamStatusValidator = [
  param("teamId")
    .isMongoId()
    .withMessage(
      "Invalid Team ID.",
    ),

  body("status")
    .trim()
    .notEmpty()
    .withMessage(
      "Team status is required.",
    )
    .bail()
    .isIn(
      Object.values(
        TEAM_STATUS,
      ),
    )
    .withMessage(
      "Invalid team status.",
    ),
];

/**
 * ============================================================
 * Team ID
 * ============================================================
 */

export const teamIdValidator = [
  param("teamId")
    .isMongoId()
    .withMessage(
      "Invalid Team ID.",
    ),
];

/**
 * ============================================================
 * Leader ID
 * ============================================================
 */

export const leaderIdValidator = [
  param("leaderId")
    .isMongoId()
    .withMessage(
      "Invalid Leader ID.",
    ),
];

/**
 * ============================================================
 * Event ID
 * ============================================================
 */

export const eventIdValidator = [
  param("eventId")
    .isMongoId()
    .withMessage(
      "Invalid Event ID.",
    ),
];

/**
 * ============================================================
 * Festival ID
 * ============================================================
 */

export const festivalIdValidator = [
  param("festivalId")
    .isMongoId()
    .withMessage(
      "Invalid Festival ID.",
    ),
];

/**
 * ============================================================
 * Team Query Validation
 * ============================================================
 */

export const teamQueryValidator = [
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

  query("status")
    .optional()
    .isIn(
      Object.values(
        TEAM_STATUS,
      ),
    )
    .withMessage(
      "Invalid team status.",
    ),
];