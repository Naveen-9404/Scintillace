import { Router } from "express";

import teamController from "../controllers/team.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";

import ROLES from "../constants/roles.js";

import {
  createTeamValidator,
  joinTeamValidator,
  leaveTeamValidator,
  removeMemberValidator,
  transferLeadershipValidator,
  updateTeamStatusValidator,
  teamIdValidator,
  leaderIdValidator,
  eventIdValidator,
  festivalIdValidator,
  teamQueryValidator,
} from "../validators/team.validator.js";

const router = Router();

/**
 * ============================================================
 * Student / Team Member Routes
 * ============================================================
 */

/**
 * Create Team
 * POST /api/v1/teams
 */
router.post(
  "/",
  authenticate,
  authorize(
    ROLES.STUDENT,
    ROLES.SUPER_ADMIN,
  ),
  ...createTeamValidator,
  validateRequest,
  teamController.createTeam,
);

/**
 * Create Team Bulk
 * POST /api/v1/teams/bulk
 */
router.post(
  "/bulk",
  authenticate,
  authorize(
    ROLES.STUDENT,
    ROLES.SUPER_ADMIN,
  ),
  teamController.createTeamBulk,
);

/**
 * Join Team
 * POST /api/v1/teams/join
 */
router.post(
  "/join",
  authenticate,
  authorize(
    ROLES.STUDENT,
    ROLES.SUPER_ADMIN,
  ),
  ...joinTeamValidator,
  validateRequest,
  teamController.joinTeam,
);

/**
 * Leave Team
 * PATCH /api/v1/teams/:teamId/leave
 */
router.patch(
  "/:teamId/leave",
  authenticate,
  ...leaveTeamValidator,
  validateRequest,
  teamController.leaveTeam,
);

/**
 * Remove Member
 * PATCH /api/v1/teams/:teamId/remove/:memberId
 */
router.patch(
  "/:teamId/remove/:memberId",
  authenticate,
  ...removeMemberValidator,
  validateRequest,
  teamController.removeMember,
);

/**
 * Transfer Leadership
 * PATCH /api/v1/teams/:teamId/transfer-leader
 */
router.patch(
  "/:teamId/transfer-leader",
  authenticate,
  ...transferLeadershipValidator,
  validateRequest,
  teamController.transferLeadership,
);

/**
 * ============================================================
 * Team Queries
 * ============================================================
 */

/**
 * Get My Teams
 * GET /api/v1/teams/my-teams
 */
router.get(
  "/my-teams",
  authenticate,
  ...teamQueryValidator,
  validateRequest,
  teamController.getMyTeams,
);

/**
 * Get Team By ID
 * GET /api/v1/teams/:teamId
 */
router.get(
  "/:teamId",
  authenticate,
  ...teamIdValidator,
  validateRequest,
  teamController.getTeamById,
);

/**
 * Get Teams By Leader
 * GET /api/v1/teams/leader/:leaderId
 */
router.get(
  "/leader/:leaderId",
  authenticate,
  ...leaderIdValidator,
  ...teamQueryValidator,
  validateRequest,
  teamController.getTeamsByLeader,
);

/**
 * Get Teams By Event
 * GET /api/v1/teams/event/:eventId
 */
router.get(
  "/event/:eventId",
  authenticate,
  ...eventIdValidator,
  ...teamQueryValidator,
  validateRequest,
  teamController.getTeamsByEvent,
);

/**
 * Get Teams By Festival
 * GET /api/v1/teams/festival/:festivalId
 */
router.get(
  "/festival/:festivalId",
  authenticate,
  ...festivalIdValidator,
  ...teamQueryValidator,
  validateRequest,
  teamController.getTeamsByFestival,
);

/**
 * ============================================================
 * Admin / Faculty Routes
 * ============================================================
 */

/**
 * Get All Teams
 * GET /api/v1/teams
 */
router.get(
  "/",
  authenticate,
  authorize(
    ROLES.FACULTY,
    ROLES.SUPER_ADMIN,
  ),
  ...teamQueryValidator,
  validateRequest,
  teamController.getAllTeams,
);

/**
 * Update Team Status
 * PATCH /api/v1/teams/:teamId/status
 */
router.patch(
  "/:teamId/status",
  authenticate,
  authorize(
    ROLES.FACULTY,
    ROLES.SUPER_ADMIN,
  ),
  ...teamIdValidator,
  ...updateTeamStatusValidator,
  validateRequest,
  teamController.updateTeamStatus,
);

/**
 * Delete / Disband Team
 * DELETE /api/v1/teams/:teamId
 */
router.delete(
  "/:teamId",
  authenticate,
  ...teamIdValidator,
  validateRequest,
  teamController.deleteTeam,
);

export default router;