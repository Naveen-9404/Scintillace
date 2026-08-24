import { apiClient } from "./axios";

/**
 * ============================================================
 * Create Team
 * ============================================================
 *
 * POST /api/v1/teams
 *
 * Body:
 * {
 *   eventId,
 *   teamName
 * }
 */

export const createTeam = async ({
  eventId,
  teamName,
}) => {
  const { data } = await apiClient.post(
    "/v1/teams",
    {
      eventId,
      teamName,
    },
  );

  return data?.data?.team;
};

/**
 * ============================================================
 * Join Team
 * ============================================================
 *
 * POST /api/v1/teams/join
 *
 * Body:
 * {
 *   inviteCode
 * }
 */

export const joinTeam = async (
  inviteCode,
) => {
  const { data } =
    await apiClient.post(
      "/v1/teams/join",
      {
        inviteCode,
      },
    );

  return data?.data?.team;
};

/**
 * ============================================================
 * Get My Teams
 * ============================================================
 *
 * GET /api/v1/teams/my-teams
 */

export const getMyTeams = async (
  params = {},
) => {
  const { data } =
    await apiClient.get(
      "/v1/teams/my-teams",
      {
        params,
      },
    );

  return data?.data?.teams || [];
};

/**
 * ============================================================
 * Get Team By ID
 * ============================================================
 *
 * GET /api/v1/teams/:teamId
 */

export const getTeam = async (
  teamId,
) => {
  const { data } =
    await apiClient.get(
      `/v1/teams/${teamId}`,
    );

  return data?.data?.team;
};

/**
 * ============================================================
 * Leave Team
 * ============================================================
 *
 * PATCH /api/v1/teams/:teamId/leave
 */

export const leaveTeam = async (
  teamId,
) => {
  const { data } =
    await apiClient.patch(
      `/v1/teams/${teamId}/leave`,
    );

  return data?.data;
};

/**
 * ============================================================
 * API Object
 * ============================================================
 */

const teamsApi = Object.freeze({
  createTeam,
  joinTeam,
  getMyTeams,
  getTeam,
  leaveTeam,
});

export default teamsApi;