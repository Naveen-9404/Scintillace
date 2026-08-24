import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";

import authRepository from "../repositories/auth.repository.js";

import env from "../config/env.js";

import HTTP_STATUS from "../constants/httpStatus.js";
import ROLES from "../constants/roles.js";

import ApiError from "../utils/ApiError.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

/**
 * ============================================================
 * Google Client
 * ============================================================
 */

const googleClient =
  new OAuth2Client(
    env.googleClientId,
  );

/**
 * ============================================================
 * Constants
 * ============================================================
 */

const TOKEN_TYPES = Object.freeze({
  REFRESH: "refresh",
});

const AUTH_PROVIDERS = Object.freeze({
  LOCAL: "LOCAL",
  GOOGLE: "GOOGLE",
});

/**
 * ============================================================
 * Helpers
 * ============================================================
 */

const normalizeEmail = (
  email,
) => {
  if (
    !email ||
    typeof email !== "string"
  ) {
    throw new ApiError(
      "Email is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new ApiError(
      "Email is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return normalizedEmail;
};

/**
 * ============================================================
 * Sanitize User
 * ============================================================
 */

const sanitizeUser = (
  user,
) => {
  if (!user) {
    return null;
  }

  if (
    typeof user.toJSON ===
    "function"
  ) {
    return user.toJSON();
  }

  const {
    password,
    refreshToken,
    googleId,
    ...safeUser
  } = user;

  return safeUser;
};

/**
 * ============================================================
 * Create JWT Payload
 * ============================================================
 */

const createTokenPayload = (
  user,
) => ({
  sub: user._id.toString(),
  email: user.email,
  role: user.role,
});

/**
 * ============================================================
 * Create Authentication Response
 * ============================================================
 */

const createAuthResponse = (
  user,
  tokens,
) => ({
  user: sanitizeUser(user),

  accessToken:
    tokens.accessToken,

  refreshToken:
    tokens.refreshToken,
});

/**
 * ============================================================
 * Active User Validation
 * ============================================================
 */

const assertActiveUser = (
  user,
  message =
    "User account is inactive.",
) => {
  if (!user?.isActive) {
    throw new ApiError(
      message,
      HTTP_STATUS.FORBIDDEN,
    );
  }
};

/**
 * ============================================================
 * Duplicate Key Detection
 * ============================================================
 */

const isDuplicateKeyError = (
  error,
) =>
  error?.code === 11000;

/**
 * ============================================================
 * Token Management
 * ============================================================
 */

const generateAndStoreTokens =
  async (
    user,
    session = null,
  ) => {
    const payload =
      createTokenPayload(
        user,
      );

    const accessToken =
      await generateAccessToken(
        payload,
      );

    const refreshToken =
      await generateRefreshToken({
        ...payload,
        tokenType:
          TOKEN_TYPES.REFRESH,
      });

    await authRepository.updateRefreshToken(
      user._id,
      refreshToken,
      session,
    );

    return {
      accessToken,
      refreshToken,
    };
  };

/**
 * ============================================================
 * Registration Data
 * ============================================================
 */

const normalizeRegistrationData =
  (data) => ({
    ...data,

    email:
      normalizeEmail(
        data.email,
      ),

    role:
      ROLES.STUDENT,

    authProvider:
      AUTH_PROVIDERS.LOCAL,
  });

/**
 * ============================================================
 * Register
 * ============================================================
 */

const register = async (
  data,
) => {
  if (!data?.password) {
    throw new ApiError(
      "Password is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const normalizedData =
    normalizeRegistrationData(
      data,
    );

  const emailExists =
    await authRepository.existsByEmail(
      normalizedData.email,
    );

  if (emailExists) {
    throw new ApiError(
      "Email is already registered.",
      HTTP_STATUS.CONFLICT,
    );
  }

  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    const user =
      await authRepository.createUser(
        normalizedData,
        session,
      );

    const tokens =
      await generateAndStoreTokens(
        user,
        session,
      );

    await session.commitTransaction();

    return createAuthResponse(
      user,
      tokens,
    );
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    if (
      isDuplicateKeyError(error)
    ) {
      throw new ApiError(
        "Email is already registered.",
        HTTP_STATUS.CONFLICT,
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * ============================================================
 * Login
 * ============================================================
 */

const login = async ({
  email,
  password,
}) => {
  if (!password) {
    throw new ApiError(
      "Password is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const normalizedEmail =
    normalizeEmail(email);

  const user =
    await authRepository.findUserByEmail(
      normalizedEmail,
      true,
    );

  if (!user?.password) {
    throw new ApiError(
      "Invalid email or password.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  assertActiveUser(user);

  const passwordMatched =
    await user.comparePassword(
      password,
    );

  if (!passwordMatched) {
    throw new ApiError(
      "Invalid email or password.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  const tokens =
    await generateAndStoreTokens(
      user,
    );

  return createAuthResponse(
    user,
    tokens,
  );
};

/**
 * ============================================================
 * Verify Google ID Token
 * ============================================================
 */

const verifyGoogleIdToken =
  async (
    idToken,
  ) => {
    if (
      !idToken ||
      typeof idToken !== "string"
    ) {
      throw new ApiError(
        "Google ID token is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    try {
      const ticket =
        await googleClient.verifyIdToken(
          {
            idToken,
            audience:
              env.googleClientId,
          },
        );

      const payload =
        ticket.getPayload();

      if (
        !payload ||
        !payload.sub ||
        !payload.email
      ) {
        throw new ApiError(
          "Invalid Google account information.",
          HTTP_STATUS.UNAUTHORIZED,
        );
      }

      if (
        payload.email_verified !==
        true
      ) {
        throw new ApiError(
          "Google email address is not verified.",
          HTTP_STATUS.UNAUTHORIZED,
        );
      }

      return {
        googleId:
          payload.sub,

        email:
          normalizeEmail(
            payload.email,
          ),

        fullName:
          typeof payload.name ===
            "string" &&
          payload.name.trim()
            ? payload.name.trim()
            : payload.email
                .split("@")[0],

        avatarUrl:
          typeof payload.picture ===
            "string"
            ? payload.picture
            : "",
      };
    } catch (error) {
      if (
        error instanceof
        ApiError
      ) {
        throw error;
      }

      throw new ApiError(
        "Invalid Google ID token.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }
  };

/**
 * ============================================================
 * Google Login
 * ============================================================
 */

const googleLogin = async ({
  idToken,
  phone,
  collegeId,
}) => {
  const googleUser =
    await verifyGoogleIdToken(
      idToken,
    );

  /**
   * ----------------------------------------------------------
   * Existing Google account
   * ----------------------------------------------------------
   */

  let user =
    await authRepository.findUserByGoogleId(
      googleUser.googleId,
    );

  if (user) {
    assertActiveUser(user);

    user.lastLoginAt =
      new Date();

    await user.save();

    const tokens =
      await generateAndStoreTokens(
        user,
      );

    return createAuthResponse(
      user,
      tokens,
    );
  }

  /**
   * ----------------------------------------------------------
   * Existing local account
   * ----------------------------------------------------------
   *
   * Never silently attach a Google identity to an existing
   * password account.
   */

  const existingUser =
    await authRepository.findUserByEmail(
      googleUser.email,
    );

  if (existingUser) {
    throw new ApiError(
      "An account already exists with this email. Please log in with your existing account before linking Google.",
      HTTP_STATUS.CONFLICT,
    );
  }

  /**
   * ----------------------------------------------------------
   * New Google account
   * ----------------------------------------------------------
   */

  if (
    !phone ||
    typeof phone !== "string"
  ) {
    throw new ApiError(
      "Phone number is required for a new Google account.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (
    !collegeId ||
    typeof collegeId !== "string"
  ) {
    throw new ApiError(
      "College ID is required for a new Google account.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const normalizedPhone =
    phone.trim();

  const normalizedCollegeId =
    collegeId.trim();

  if (!normalizedPhone) {
    throw new ApiError(
      "Phone number is required for a new Google account.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (!normalizedCollegeId) {
    throw new ApiError(
      "College ID is required for a new Google account.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const session =
    await mongoose.startSession();

  try {
    session.startTransaction();

    user =
      await authRepository.createUser(
        {
          fullName:
            googleUser.fullName,

          email:
            googleUser.email,

          authProvider:
            AUTH_PROVIDERS.GOOGLE,

          googleId:
            googleUser.googleId,

          phone:
            normalizedPhone,

          collegeId:
            normalizedCollegeId,

          avatarUrl:
            googleUser.avatarUrl,

          role:
            ROLES.STUDENT,

          isActive:
            true,

          isEmailVerified:
            true,
        },
        session,
      );

    const tokens =
      await generateAndStoreTokens(
        user,
        session,
      );

    await session.commitTransaction();

    return createAuthResponse(
      user,
      tokens,
    );
  } catch (error) {
    if (
      session.inTransaction()
    ) {
      await session.abortTransaction();
    }

    if (
      isDuplicateKeyError(error)
    ) {
      throw new ApiError(
        "An account already exists with this Google account or email.",
        HTTP_STATUS.CONFLICT,
      );
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * ============================================================
 * Logout
 * ============================================================
 */

const logout = async (
  userId,
) => {
  if (!userId) {
    throw new ApiError(
      "User ID is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  await authRepository.clearRefreshToken(
    userId,
  );

  return {
    success: true,
    message:
      "Logged out successfully.",
  };
};

/**
 * ============================================================
 * Refresh Access Token
 * ============================================================
 */

const refreshAccessToken =
  async (
    refreshToken,
  ) => {
    if (!refreshToken) {
      throw new ApiError(
        "Refresh token is required.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    let decoded;

    try {
      decoded =
        await verifyRefreshToken(
          refreshToken,
        );
    } catch {
      throw new ApiError(
        "Invalid refresh token.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (
      decoded?.tokenType !==
        TOKEN_TYPES.REFRESH ||
      !decoded?.sub
    ) {
      throw new ApiError(
        "Invalid refresh token.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const user =
      await authRepository.findUserById(
        decoded.sub,
        true,
      );

    if (!user) {
      throw new ApiError(
        "User not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    assertActiveUser(user);

    if (
      user.refreshToken !==
      refreshToken
    ) {
      throw new ApiError(
        "Refresh token has been revoked.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const tokens =
      await generateAndStoreTokens(
        user,
      );

    return createAuthResponse(
      user,
      tokens,
    );
  };

/**
 * ============================================================
 * Get Current User
 * ============================================================
 */

const getCurrentUser =
  async (
    userId,
  ) => {
    if (!userId) {
      throw new ApiError(
        "User ID is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const user =
      await authRepository.findUserById(
        userId,
      );

    if (!user) {
      throw new ApiError(
        "User not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    assertActiveUser(user);

    return sanitizeUser(user);
  };

/**
 * ============================================================
 * Update Current User Profile
 * ============================================================
 *
 * PATCH /api/v1/auth/me
 *
 * Only safe profile fields are accepted.
 *
 * Editable:
 * - fullName
 * - phone
 * - collegeId
 * - avatarUrl
 *
 * Protected:
 * - email
 * - password
 * - role
 * - authProvider
 * - googleId
 * - refreshToken
 * - isActive
 * - isEmailVerified
 * - lastLoginAt
 */

const updateProfile =
  async (
    userId,
    data,
  ) => {
    if (!userId) {
      throw new ApiError(
        "User ID is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const updateData = {};

    if (
      typeof data?.fullName ===
      "string"
    ) {
      updateData.fullName =
        data.fullName.trim();
    }

    if (
      typeof data?.phone ===
      "string"
    ) {
      updateData.phone =
        data.phone.trim();
    }

    if (
      typeof data?.collegeId ===
      "string"
    ) {
      updateData.collegeId =
        data.collegeId.trim();
    }

    if (
      typeof data?.avatarUrl ===
      "string"
    ) {
      updateData.avatarUrl =
        data.avatarUrl.trim();
    }

    if (
      Object.keys(updateData)
        .length === 0
    ) {
      throw new ApiError(
        "No profile fields were provided for update.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const user =
      await authRepository.updateProfile(
        userId,
        updateData,
      );

    if (!user) {
      throw new ApiError(
        "User not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    assertActiveUser(user);

    return sanitizeUser(user);
  };

/**
 * ============================================================
 * Export
 * ============================================================
 */

const authService =
  Object.freeze({
    register,
    login,
    googleLogin,
    logout,
    refreshAccessToken,
    getCurrentUser,
    updateProfile,
  });

export default authService;