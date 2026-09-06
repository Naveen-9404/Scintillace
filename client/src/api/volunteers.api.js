import { apiClient } from "./axios";

/**
 * ============================================================
 * Get My Volunteer Assignments
 * ============================================================
 *
 * GET /api/v1/volunteers/me
 *
 * Returns volunteer assignments belonging to the
 * currently authenticated volunteer.
 *
 * Scanner accounts use this to determine the event
 * they are assigned to.
 */

export const getMyVolunteerAssignments =
  async () => {
    const { data } =
      await apiClient.get(
        "/volunteers/me",
      );

    return (
      data?.data?.volunteers ||
      []
    );
  };

/**
 * ============================================================
 * Volunteers API Export
 * ============================================================
 */

const volunteersApi =
  Object.freeze({
    getMyVolunteerAssignments,
  });

export default volunteersApi;
