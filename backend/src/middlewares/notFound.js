import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Handle Unknown Routes
 * ============================================================
 */

const notFoundHandler = (
  req,
  res,
  next,
) => {
  return next(
    new ApiError(
      `Route not found: ${req.originalUrl}`,
      HTTP_STATUS.NOT_FOUND,
    ),
  );
};

export default Object.freeze(
  notFoundHandler,
);