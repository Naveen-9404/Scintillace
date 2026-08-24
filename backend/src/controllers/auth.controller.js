import env from "../config/env.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import authService from "../services/auth.service.js";

/**
 * ============================================================
 * Refresh Token Cookie Configuration
 * ============================================================
 */

const cookieOptions = Object.freeze({
  httpOnly: true,

  secure:
    env.nodeEnv ===
    "production",

  sameSite: "lax",

  path: "/api/v1/auth",

  maxAge:
    7 *
    24 *
    60 *
    60 *
    1000,
});

/**
 * ============================================================
 * Clear Refresh Token Cookie Configuration
 * ============================================================
 */

const clearCookieOptions =
  Object.freeze({
    httpOnly: true,

    secure:
      env.nodeEnv ===
      "production",

    sameSite: "lax",

    path: "/api/v1/auth",
  });

/**
 * ============================================================
 * Register
 * ============================================================
 */

const register =
  asyncHandler(
    async (req, res) => {
      const {
        user,
        accessToken,
        refreshToken,
      } =
        await authService.register(
          req.body,
        );

      res.cookie(
        "refreshToken",
        refreshToken,
        cookieOptions,
      );

      return ApiResponse.success(
        res,
        {
          user,
          accessToken,
        },
        "User registered successfully.",
      );
    },
  );

/**
 * ============================================================
 * Login
 * ============================================================
 */

const login =
  asyncHandler(
    async (req, res) => {
      const {
        user,
        accessToken,
        refreshToken,
      } =
        await authService.login(
          req.body,
        );

      res.cookie(
        "refreshToken",
        refreshToken,
        cookieOptions,
      );

      return ApiResponse.success(
        res,
        {
          user,
          accessToken,
        },
        "Login successful.",
      );
    },
  );

/**
 * ============================================================
 * Refresh Access Token
 * ============================================================
 */

const refreshToken =
  asyncHandler(
    async (req, res) => {
      const token =
        req.cookies?.refreshToken;

      const {
        user,
        accessToken,
        refreshToken:
          newRefreshToken,
      } =
        await authService.refreshAccessToken(
          token,
        );

      res.cookie(
        "refreshToken",
        newRefreshToken,
        cookieOptions,
      );

      return ApiResponse.success(
        res,
        {
          user,
          accessToken,
        },
        "Access token refreshed successfully.",
      );
    },
  );

/**
 * ============================================================
 * Logout
 * ============================================================
 */

const logout =
  asyncHandler(
    async (req, res) => {
      const userId =
        req.user?.id ??
        req.user?._id ??
        req.user?.sub;

      await authService.logout(
        userId,
      );

      res.clearCookie(
        "refreshToken",
        clearCookieOptions,
      );

      return ApiResponse.success(
        res,
        null,
        "Logout successful.",
      );
    },
  );

/**
 * ============================================================
 * Get Current User
 * ============================================================
 *
 * GET /api/v1/auth/me
 */

const getCurrentUser =
  asyncHandler(
    async (req, res) => {
      const userId =
        req.user?.id ??
        req.user?._id ??
        req.user?.sub;

      const user =
        await authService.getCurrentUser(
          userId,
        );

      return ApiResponse.success(
        res,
        {
          user,
        },
        "Current user fetched successfully.",
      );
    },
  );

/**
 * ============================================================
 * Update Current User Profile
 * ============================================================
 *
 * PATCH /api/v1/auth/me
 *
 * Allowed fields:
 * - fullName
 * - phone
 * - collegeId
 * - avatarUrl
 *
 * Authentication and sensitive account fields cannot
 * be modified through this endpoint.
 */

const updateProfile =
  asyncHandler(
    async (req, res) => {
      const userId =
        req.user?.id ??
        req.user?._id ??
        req.user?.sub;

      const user =
        await authService.updateProfile(
          userId,
          req.body,
        );

      return ApiResponse.success(
        res,
        {
          user,
        },
        "Profile updated successfully.",
      );
    },
  );

/**
 * ============================================================
 * Export
 * ============================================================
 */

const authController =
  Object.freeze({
    register,
    login,
    refreshToken,
    logout,
    getCurrentUser,
    updateProfile,
  });

export default authController;