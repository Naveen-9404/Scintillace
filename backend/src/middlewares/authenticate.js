import authRepository from "../repositories/auth.repository.js";

import ApiError from "../utils/ApiError.js";
import {
  verifyAccessToken,
} from "../utils/jwt.js";

import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Extract Bearer Token
 * ============================================================
 */

/**
 * Extract the JWT from:
 *
 * Authorization: Bearer <token>
 *
 * @param {string|undefined} authorization
 * @returns {string}
 */
const extractBearerToken = (
  authorization,
) => {
  if (
    !authorization ||
    typeof authorization !== "string" ||
    !authorization.startsWith(
      "Bearer ",
    )
  ) {
    throw new ApiError(
      "Authentication token is required.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  const token =
    authorization
      .slice(7)
      .trim();

  if (!token) {
    throw new ApiError(
      "Authentication token is required.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  return token;
};

/**
 * ============================================================
 * Authenticate User
 * ============================================================
 */

/**
 * Authenticate the request using
 * the access token.
 *
 * Flow:
 *
 * Request
 *   ↓
 * Authorization header
 *   ↓
 * Verify JWT
 *   ↓
 * Extract user ID
 *   ↓
 * Find current user in MongoDB
 *   ↓
 * Check active status
 *   ↓
 * req.user
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const authenticate = async (
  req,
  res,
  next,
) => {
  try {
    /**
     * --------------------------------------------------------
     * 1. Extract access token
     * --------------------------------------------------------
     */

    const token =
      extractBearerToken(
        req.headers.authorization,
      );

    /**
     * --------------------------------------------------------
     * 2. Verify access token
     * --------------------------------------------------------
     */

    const payload =
      await verifyAccessToken(
        token,
      );

    /**
     * --------------------------------------------------------
     * 3. Validate JWT payload
     * --------------------------------------------------------
     */

    if (
      !payload ||
      !payload.sub
    ) {
      throw new ApiError(
        "Invalid authentication token.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    /**
     * --------------------------------------------------------
     * 4. Fetch current user
     * --------------------------------------------------------
     *
     * We intentionally fetch the user from
     * MongoDB instead of trusting user details
     * entirely from the JWT.
     *
     * This means:
     *
     * - Disabled accounts are immediately blocked.
     * - Updated roles are respected.
     * - Deleted users cannot continue using old tokens.
     */

    const user =
      await authRepository.findUserById(
        payload.sub,
      );

    if (!user) {
      throw new ApiError(
        "Invalid authentication token.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    /**
     * --------------------------------------------------------
     * 5. Check account status
     * --------------------------------------------------------
     */

    if (!user.isActive) {
      throw new ApiError(
        "User account is inactive.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    /**
     * --------------------------------------------------------
     * 6. Attach user to request
     * --------------------------------------------------------
     */

    req.user = user;

    /**
     * --------------------------------------------------------
     * 7. Continue request
     * --------------------------------------------------------
     */

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * ============================================================
 * Export
 * ============================================================
 */

export default Object.freeze(
  authenticate,
);