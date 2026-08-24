import mongoose from "mongoose";

import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";
import env from "../config/env.js";

/**
 * ============================================================
 * Global Error Handler
 * ============================================================
 */

const errorHandler = (
  err,
  req,
  res,
  next,
) => {
  console.log(
    "\n================ ERROR DEBUG ================",
  );

  console.log(
    "Error object:",
    err,
  );

  console.log(
    "Error name:",
    err?.name,
  );

  console.log(
    "Error message:",
    err?.message,
  );

  console.log(
    "Error statusCode:",
    err?.statusCode,
  );

  console.log(
    "Error statusCode type:",
    typeof err?.statusCode,
  );

  console.log(
    "Error constructor:",
    err?.constructor?.name,
  );

  console.log(
    "Is ApiError:",
    err instanceof ApiError,
  );

  console.log(
    "Request:",
    req.method,
    req.originalUrl,
  );

  console.log(
    "==============================================\n",
  );

  let error = err;

  /**
   * ========================================================
   * Invalid MongoDB ObjectId
   * ========================================================
   */

  if (
    error instanceof
    mongoose.Error.CastError
  ) {
    error = new ApiError(
      `Invalid ${error.path}.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  /**
   * ========================================================
   * Mongoose Validation Error
   * ========================================================
   */

  else if (
    error instanceof
    mongoose.Error.ValidationError
  ) {
    error = new ApiError(
      "Validation failed.",
      HTTP_STATUS.BAD_REQUEST,
      Object.values(
        error.errors,
      ).map((item) => ({
        field: item.path,
        message: item.message,
      })),
    );
  }

  /**
   * ========================================================
   * Duplicate MongoDB Key
   * ========================================================
   */

  else if (
    error?.code === 11000
  ) {
    const field =
      Object.keys(
        error.keyValue || {},
      )[0] || "field";

    error = new ApiError(
      `${field} already exists.`,
      HTTP_STATUS.CONFLICT,
    );
  }

  /**
   * ========================================================
   * JWT Errors
   * ========================================================
   */

  else if (
    error?.name ===
    "JsonWebTokenError"
  ) {
    error = new ApiError(
      "Invalid authentication token.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  else if (
    error?.name ===
    "TokenExpiredError"
  ) {
    error = new ApiError(
      "Authentication token has expired.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  /**
   * ========================================================
   * Application Error
   * ========================================================
   */

  else if (
    error &&
    Number.isInteger(
      error.statusCode,
    ) &&
    error.statusCode >= 400 &&
    error.statusCode <= 599
  ) {
    // Preserve application error.
  }

  /**
   * ========================================================
   * Unknown Error
   * ========================================================
   */

  else {
    console.error(
      "UNKNOWN ERROR REACHED ERROR HANDLER:",
      error,
    );

    error = new ApiError(
      "Internal Server Error.",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * ========================================================
   * Logging
   * ========================================================
   */

  if (
    env.nodeEnv !== "test"
  ) {
    console.error(
      `[${req.method}] ${req.originalUrl}`,
      err,
    );
  }

  /**
   * ========================================================
   * Response
   * ========================================================
   */

  const response = {
    success: false,

    message:
      error.message ||
      "Something went wrong.",

    data: null,
  };

  if (
    Array.isArray(
      error.errors,
    ) &&
    error.errors.length > 0
  ) {
    response.errors =
      error.errors;
  }

  if (
    env.nodeEnv !==
    "production"
  ) {
    response.stack =
      error.stack;
  }

  return res
    .status(
      Number.isInteger(
        error.statusCode,
      )
        ? error.statusCode
        : HTTP_STATUS.INTERNAL_SERVER_ERROR,
    )
    .json(response);
};

export default Object.freeze(
  errorHandler,
);