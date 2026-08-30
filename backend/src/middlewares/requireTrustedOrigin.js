import {
  isTrustedClientOrigin,
} from "../config/cors.js";

import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * Protect endpoints that set or rotate the HTTP-only refresh cookie.
 *
 * Production cookies use SameSite=None so the Vercel frontend can call the
 * Render API. CORS controls response access, but does not prevent a forged
 * browser request from reaching the server; this origin check does.
 */
const requireTrustedOrigin = (
  req,
  res,
  next,
) => {
  const origin =
    req.get("origin");

  if (!isTrustedClientOrigin(origin)) {
    return next(
      new ApiError(
        "Request origin is not allowed.",
        HTTP_STATUS.FORBIDDEN,
      ),
    );
  }

  return next();
};

export default Object.freeze(
  requireTrustedOrigin,
);
