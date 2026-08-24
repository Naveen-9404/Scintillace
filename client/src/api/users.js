import { apiClient } from "./axios";

/**
 * Update the currently authenticated user's profile.
 *
 * PATCH /api/v1/auth/me
 *
 * Allowed fields:
 * - fullName
 * - phone
 * - collegeId
 * - avatarUrl
 */
export const updateProfile =
  async (payload) => {
    const response =
      await apiClient.patch(
        "/v1/auth/me",
        payload,
      );

    return response.data.data.user;
  };

const usersApi = Object.freeze({
  updateProfile,
});

export default usersApi;