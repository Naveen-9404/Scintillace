import { apiClient } from "./axios";

/**
 * ============================================================
 * Register
 * ============================================================
 */

const register = async (payload) => {
  const response =
    await apiClient.post(
      "/v1/auth/register",
      payload,
      {
        withCredentials: true,
      },
    );

  const data =
    response.data?.data;

  if (!data?.accessToken) {
    throw new Error(
      "Registration response did not contain an access token.",
    );
  }

  return data;
};

/**
 * ============================================================
 * Login
 * ============================================================
 */

const login = async (payload) => {
  const response =
    await apiClient.post(
      "/v1/auth/login",
      payload,
      {
        withCredentials: true,
      },
    );

  const data =
    response.data?.data;

  if (!data?.accessToken) {
    throw new Error(
      "Login response did not contain an access token.",
    );
  }

  return data;
};

/**
 * ============================================================
 * Refresh Access Token
 * ============================================================
 *
 * Refresh token is stored in an HTTP-only cookie.
 *
 * Therefore credentials MUST be included.
 */

const refreshAccessToken =
  async () => {
    const response =
      await apiClient.post(
        "/v1/auth/refresh",
        {},
        {
          withCredentials: true,
        },
      );

    const data =
      response.data?.data;

    if (!data?.accessToken) {
      throw new Error(
        "Refresh response did not contain an access token.",
      );
    }

    return data;
  };

/**
 * ============================================================
 * Current User
 * ============================================================
 */

const getCurrentUser =
  async () => {
    const response =
      await apiClient.get(
        "/v1/auth/me",
        {
          withCredentials: true,
        },
      );

    return (
      response.data?.data?.user ||
      null
    );
  };

/**
 * ============================================================
 * Logout
 * ============================================================
 */

const logout =
  async () => {
    const response =
      await apiClient.post(
        "/v1/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );

    return response.data;
  };

/**
 * ============================================================
 * Export
 * ============================================================
 */

const authApi =
  Object.freeze({
    register,
    login,
    refreshAccessToken,
    getCurrentUser,
    logout,
  });

export {
  register,
  login,
  refreshAccessToken,
  getCurrentUser,
  logout,
};

export default authApi;