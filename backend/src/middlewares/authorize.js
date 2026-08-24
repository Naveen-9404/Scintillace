import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Authorize User By Role
 * ============================================================
 *
 * Usage:
 *
 * authorize(
 *   ROLES.STUDENT,
 *   ROLES.FACULTY,
 * )
 *
 * Authentication must run before authorization.
 *
 * @param {...string} allowedRoles
 * @returns {import("express").RequestHandler}
 */

const authorize = (
  ...allowedRoles
) => {
  return (
    req,
    res,
    next,
  ) => {
    /**
     * User must be authenticated.
     */
    if (!req.user) {
      return next(
        new ApiError(
          "Authentication required.",
          HTTP_STATUS.UNAUTHORIZED,
        ),
      );
    }

    /**
     * User's role must be allowed.
     */
    if (
      !allowedRoles.includes(
        req.user.role,
      )
    ) {
      return next(
        new ApiError(
          "You are not authorized to perform this action.",
          HTTP_STATUS.FORBIDDEN,
        ),
      );
    }

    return next();
  };
};

/**
 * ============================================================
 * Export
 * ============================================================
 */

export default Object.freeze(
  authorize,
);