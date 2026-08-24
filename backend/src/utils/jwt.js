import jwt from "jsonwebtoken";
import { promisify } from "node:util";

import env from "../config/env.js";
import HTTP_STATUS from "../constants/httpStatus.js";

const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

const JWT_ALGORITHM = "HS256";

/**
 * ============================================================
 * Custom JWT Utility Error
 * ============================================================
 */

export class JwtUtilityError extends Error {
  constructor(
    message,
    statusCode = HTTP_STATUS.UNAUTHORIZED,
    cause = null,
  ) {
    super(
      message,
      cause
        ? {
            cause,
          }
        : undefined,
    );

    this.name = "JwtUtilityError";

    this.statusCode = statusCode;

    this.success = false;

    Error.captureStackTrace?.(
      this,
      this.constructor,
    );
  }
}

/**
 * ============================================================
 * Ensure Required Configuration
 * ============================================================
 */

const ensureConfig = (
  value,
  name,
) => {
  if (!value) {
    throw new JwtUtilityError(
      `${name} is not configured.`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  return value;
};

/**
 * ============================================================
 * Validate JWT Payload
 * ============================================================
 */

const validatePayload = (
  payload,
) => {
  if (
    !payload ||
    typeof payload !== "object" ||
    Array.isArray(payload)
  ) {
    throw new JwtUtilityError(
      "JWT payload must be a valid object.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

/**
 * ============================================================
 * Validate Token
 * ============================================================
 */

const validateToken = (
  token,
  label,
) => {
  if (
    typeof token !== "string" ||
    token.trim().length === 0
  ) {
    throw new JwtUtilityError(
      `${label} is required.`,
      HTTP_STATUS.UNAUTHORIZED,
    );
  }
};

/**
 * ============================================================
 * Sign JWT
 * ============================================================
 */

const signToken = async ({
  payload,
  secret,
  expiresIn,
  label,
}) => {
  validatePayload(payload);

  try {
    return await signAsync(
      payload,
      secret,
      {
        algorithm: JWT_ALGORITHM,
        expiresIn,
      },
    );
  } catch (error) {
    throw new JwtUtilityError(
      `Unable to generate ${label}.`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error,
    );
  }
};

/**
 * ============================================================
 * Verify JWT
 * ============================================================
 */

const verifyToken = async ({
  token,
  secret,
  label,
}) => {
  validateToken(
    token,
    label,
  );

  try {
    return await verifyAsync(
      token,
      secret,
      {
        algorithms: [
          JWT_ALGORITHM,
        ],
      },
    );
  } catch (error) {
    /**
     * --------------------------------------------------------
     * Expired Token
     * --------------------------------------------------------
     */

    if (
      error instanceof
      jwt.TokenExpiredError
    ) {
      throw new JwtUtilityError(
        `${label} has expired.`,
        HTTP_STATUS.UNAUTHORIZED,
        error,
      );
    }

    /**
     * --------------------------------------------------------
     * Invalid Token
     * --------------------------------------------------------
     */

    if (
      error instanceof
      jwt.JsonWebTokenError
    ) {
      throw new JwtUtilityError(
        `${label} is invalid.`,
        HTTP_STATUS.UNAUTHORIZED,
        error,
      );
    }

    /**
     * --------------------------------------------------------
     * Unknown Verification Error
     * --------------------------------------------------------
     */

    throw new JwtUtilityError(
      `Unable to verify ${label}.`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error,
    );
  }
};

/**
 * ============================================================
 * Generate Access Token
 * ============================================================
 */

export const generateAccessToken =
  async (payload) =>
    signToken({
      payload,

      secret: ensureConfig(
        env.accessTokenSecret,
        "Access token secret",
      ),

      expiresIn: ensureConfig(
        env.accessTokenExpiresIn,
        "Access token expiry",
      ),

      label: "access token",
    });

/**
 * ============================================================
 * Generate Refresh Token
 * ============================================================
 */

export const generateRefreshToken =
  async (payload) =>
    signToken({
      payload,

      secret: ensureConfig(
        env.refreshTokenSecret,
        "Refresh token secret",
      ),

      expiresIn: ensureConfig(
        env.refreshTokenExpiresIn,
        "Refresh token expiry",
      ),

      label: "refresh token",
    });

/**
 * ============================================================
 * Verify Access Token
 * ============================================================
 */

export const verifyAccessToken =
  async (token) =>
    verifyToken({
      token,

      secret: ensureConfig(
        env.accessTokenSecret,
        "Access token secret",
      ),

      label: "Access token",
    });

/**
 * ============================================================
 * Verify Refresh Token
 * ============================================================
 */

export const verifyRefreshToken =
  async (token) =>
    verifyToken({
      token,

      secret: ensureConfig(
        env.refreshTokenSecret,
        "Refresh token secret",
      ),

      label: "Refresh token",
    });

/**
 * ============================================================
 * Export
 * ============================================================
 */

export default Object.freeze({
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
});