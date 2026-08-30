import teamService from "../services/team.service.js";

import HTTP_STATUS from "../constants/httpStatus.js";
import ROLES from "../constants/roles.js";

import asyncHandler from "../utils/asyncHandler.js";

/**
 * ============================================================
 * Create Team
 * ============================================================
 */

const createTeam = asyncHandler(
  async (req, res) => {
    const {
      eventId,
      teamName,
    } = req.body;

    const team =
      await teamService.createTeam({
        leaderId:
          req.user._id,
        eventId,
        teamName,
      });

    return res
      .status(
        HTTP_STATUS.CREATED,
      )
      .json({
        success: true,
        message:
          "Team created successfully.",
        data: {
          team,
        },
      });
  },
);

/**
 * ============================================================
 * Join Team
 * ============================================================
 */

const joinTeam = asyncHandler(
  async (req, res) => {
    const {
      inviteCode,
    } = req.body;

    const team =
      await teamService.joinTeam({
        inviteCode,
        userId:
          req.user._id,
      });

    return res
      .status(
        HTTP_STATUS.OK,
      )
      .json({
        success: true,
        message:
          "Joined team successfully.",
        data: {
          team,
        },
      });
  },
);

/**
 * ============================================================
 * Leave Team
 * ============================================================
 */

const leaveTeam = asyncHandler(
  async (req, res) => {
    const result =
      await teamService.leaveTeam({
        teamId:
          req.params.teamId,
        userId:
          req.user._id,
      });

    return res
      .status(
        HTTP_STATUS.OK,
      )
      .json({
        success: true,
        message:
          result?.message ??
          "Left team successfully.",
        data: result,
      });
  },
);

/**
 * ============================================================
 * Remove Team Member
 * ============================================================
 */

const removeMember =
  asyncHandler(
    async (req, res) => {
      const team =
        await teamService.removeMember(
          {
            teamId:
              req.params.teamId,

            leaderId:
              req.user._id,

            memberId:
              req.params.memberId,
          },
        );

      return res
        .status(
          HTTP_STATUS.OK,
        )
        .json({
          success: true,
          message:
            "Member removed successfully.",
          data: {
            team,
          },
        });
    },
  );

/**
 * ============================================================
 * Transfer Leadership
 * ============================================================
 */

const transferLeadership =
  asyncHandler(
    async (req, res) => {
      const {
        newLeaderId,
      } = req.body;

      const team =
        await teamService.transferLeadership(
          {
            teamId:
              req.params.teamId,

            currentLeaderId:
              req.user._id,

            newLeaderId,
          },
        );

      return res
        .status(
          HTTP_STATUS.OK,
        )
        .json({
          success: true,
          message:
            "Leadership transferred successfully.",
          data: {
            team,
          },
        });
    },
  );

/**
 * ============================================================
 * Delete / Disband Team
 * ============================================================
 */

const deleteTeam = asyncHandler(
  async (req, res) => {
    const isAdmin =
      req.user.role ===
      ROLES.SUPER_ADMIN;

    const result =
      await teamService.deleteTeam({
        teamId:
          req.params.teamId,

        userId:
          req.user._id,

        isAdmin,
      });

    return res
      .status(
        HTTP_STATUS.OK,
      )
      .json({
        success: true,
        message:
          "Team disbanded successfully.",
        data: {
          team: result,
        },
      });
  },
);

/**
 * ============================================================
 * Update Team Status
 * ============================================================
 *
 * This endpoint should be protected by
 * SUPER_ADMIN/FACULTY authorization at route level.
 */

const updateTeamStatus =
  asyncHandler(
    async (req, res) => {
      const {
        status,
      } = req.body;

      const team =
        await teamService.updateTeamStatus({
          teamId:
            req.params.teamId,

          status,
        });

      return res
        .status(
          HTTP_STATUS.OK,
        )
        .json({
          success: true,
          message:
            "Team status updated successfully.",
          data: {
            team,
          },
        });
    },
  );

/**
 * ============================================================
 * Get Team By ID
 * ============================================================
 */

const getTeamById =
  asyncHandler(
    async (req, res) => {
      const team =
        await teamService.getTeamById(
          req.params.teamId,
        );

      return res
        .status(
          HTTP_STATUS.OK,
        )
        .json({
          success: true,
          data: {
            team,
          },
        });
    },
  );

/**
 * ============================================================
 * Get My Teams
 * ============================================================
 */

const getMyTeams =
  asyncHandler(
    async (req, res) => {
      const page =
        Number(
          req.query.page,
        ) || 1;

      const limit =
        Number(
          req.query.limit,
        ) || 10;

      const teams =
        await teamService.getMyTeams(
          req.user._id,
          page,
          limit,
        );

      return res
        .status(
          HTTP_STATUS.OK,
        )
        .json({
          success: true,
          data: {
            teams,
          },
        });
    },
  );

/**
 * ============================================================
 * Get Teams By Leader
 * ============================================================
 */

const getTeamsByLeader =
  asyncHandler(
    async (req, res) => {
      const page =
        Number(
          req.query.page,
        ) || 1;

      const limit =
        Number(
          req.query.limit,
        ) || 10;

      const teams =
        await teamService.getTeamsByLeader(
          req.params.leaderId,
          page,
          limit,
        );

      return res
        .status(
          HTTP_STATUS.OK,
        )
        .json({
          success: true,
          data: {
            teams,
          },
        });
    },
  );

/**
 * ============================================================
 * Get Teams By Event
 * ============================================================
 */

const getTeamsByEvent =
  asyncHandler(
    async (req, res) => {
      const page =
        Number(
          req.query.page,
        ) || 1;

      const limit =
        Number(
          req.query.limit,
        ) || 10;

      const teams =
        await teamService.getTeamsByEvent(
          req.params.eventId,
          page,
          limit,
        );

      return res
        .status(
          HTTP_STATUS.OK,
        )
        .json({
          success: true,
          data: {
            teams,
          },
        });
    },
  );

/**
 * ============================================================
 * Get Teams By Festival
 * ============================================================
 */

const getTeamsByFestival =
  asyncHandler(
    async (req, res) => {
      const page =
        Number(
          req.query.page,
        ) || 1;

      const limit =
        Number(
          req.query.limit,
        ) || 10;

      const teams =
        await teamService.getTeamsByFestival(
          req.params.festivalId,
          page,
          limit,
        );

      return res
        .status(
          HTTP_STATUS.OK,
        )
        .json({
          success: true,
          data: {
            teams,
          },
        });
    },
  );

/**
 * ============================================================
 * Get All Teams
 * ============================================================
 */

const getAllTeams =
  asyncHandler(
    async (req, res) => {
      const page =
        Number(
          req.query.page,
        ) || 1;

      const limit =
        Number(
          req.query.limit,
        ) || 10;

      const result =
        await teamService.getAllTeams({
          page,
          limit,
        });

      return res
        .status(
          HTTP_STATUS.OK,
        )
        .json({
          success: true,
          data: {
            teams:
              result.teams,
          },
          pagination:
            result.pagination,
        });
    },
  );

/**
 * ============================================================
 * Create Team Bulk
 * ============================================================
 */

const createTeamBulk = asyncHandler(
  async (req, res) => {
    const {
      eventId,
      teamName,
      participants,
    } = req.body;

    const team =
      await teamService.createTeamWithMembers({
        leaderId:
          req.user._id,
        eventId,
        teamName,
        participants,
      });

    return res
      .status(
        HTTP_STATUS.CREATED,
      )
      .json({
        success: true,
        message:
          "Team created successfully with members.",
        data: {
          team,
        },
      });
  },
);

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

const teamController =
  Object.freeze({
    createTeam,
    createTeamBulk,
    joinTeam,
    leaveTeam,
    removeMember,
    transferLeadership,
    deleteTeam,
    updateTeamStatus,
    getTeamById,
    getMyTeams,
    getTeamsByLeader,
    getTeamsByEvent,
    getTeamsByFestival,
    getAllTeams,
  });

export default teamController;