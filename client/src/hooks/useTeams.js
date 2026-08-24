import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import teamsApi from "../api/teams.api";

/**
 * ============================================================
 * Team Query Keys
 * ============================================================
 */

export const TEAM_QUERY_KEYS =
  Object.freeze({
    all: ["teams"],

    mine: (params = {}) => [
      "teams",
      "mine",
      params,
    ],

    detail: (teamId) => [
      "teams",
      "detail",
      teamId,
    ],
  });

/**
 * ============================================================
 * My Teams
 * ============================================================
 */

export const useMyTeams = (
  params = {},
) => {
  return useQuery({
    queryKey:
      TEAM_QUERY_KEYS.mine(params),

    queryFn: () =>
      teamsApi.getMyTeams(params),

    staleTime: 30 * 1000,
  });
};

/**
 * ============================================================
 * Team Details
 * ============================================================
 */

export const useTeam = (
  teamId,
) => {
  return useQuery({
    queryKey:
      TEAM_QUERY_KEYS.detail(
        teamId,
      ),

    queryFn: () =>
      teamsApi.getTeam(teamId),

    enabled:
      Boolean(teamId),

    staleTime: 30 * 1000,
  });
};

/**
 * ============================================================
 * Create Team
 * ============================================================
 */

export const useCreateTeam = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      teamsApi.createTeam,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.all,
      });
    },
  });
};

/**
 * ============================================================
 * Join Team
 * ============================================================
 */

export const useJoinTeam = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      teamsApi.joinTeam,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.all,
      });
    },
  });
};

/**
 * ============================================================
 * Leave Team
 * ============================================================
 */

export const useLeaveTeam = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      teamsApi.leaveTeam,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          TEAM_QUERY_KEYS.all,
      });
    },
  });
};