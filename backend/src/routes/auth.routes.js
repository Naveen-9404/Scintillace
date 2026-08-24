import { Router } from "express";

import authController from "../controllers/auth.controller.js";

import authenticate from "../middlewares/authenticate.js";
import validate from "../middlewares/validate.js";

import authValidator from "../validators/auth.validator.js";

const router = Router();

/**
 * ============================================================
 * Public Authentication Routes
 * ============================================================
 */

/**
 * Register
 *
 * POST /api/v1/auth/register
 */

router.post(
  "/register",
  authValidator.register,
  validate,
  authController.register,
);

/**
 * Login
 *
 * POST /api/v1/auth/login
 */

router.post(
  "/login",
  authValidator.login,
  validate,
  authController.login,
);

/**
 * Google Login
 *
 * POST /api/v1/auth/google
 */

router.post(
  "/google",
  authValidator.googleLogin,
  validate,
  authController.googleLogin,
);

/**
 * Refresh Access Token
 *
 * POST /api/v1/auth/refresh
 */

router.post(
  "/refresh",
  authController.refreshToken,
);

/**
 * ============================================================
 * Protected Authentication Routes
 * ============================================================
 */

/**
 * Logout
 *
 * POST /api/v1/auth/logout
 */

router.post(
  "/logout",
  authenticate,
  authController.logout,
);

/**
 * Get Current User
 *
 * GET /api/v1/auth/me
 */

router.get(
  "/me",
  authenticate,
  authController.getCurrentUser,
);

/**
 * Update Current User Profile
 *
 * PATCH /api/v1/auth/me
 *
 * Allowed fields:
 * - fullName
 * - phone
 * - collegeId
 * - avatarUrl
 *
 * Sensitive authentication/account fields are not accepted.
 */

router.patch(
  "/me",
  authenticate,
  authController.updateProfile,
);

export default router;