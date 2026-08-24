import { User } from "../models/index.js";

/**
 * ============================================================
 * Create User
 * ============================================================
 */

const createUser = async (
  userData,
  session = null,
) => {
  const options = session
    ? { session }
    : {};

  const [user] = await User.create(
    [userData],
    options,
  );

  return user;
};

/**
 * ============================================================
 * Find User By Email
 * ============================================================
 */

const findUserByEmail = async (
  email,
  includePassword = false,
) => {
  const query = User.findOne({
    email: email
      .trim()
      .toLowerCase(),
  });

  if (includePassword) {
    query.select(
      "+password +refreshToken",
    );
  }

  return query.exec();
};

/**
 * ============================================================
 * Find User By ID
 * ============================================================
 */

const findUserById = async (
  userId,
  includeRefreshToken = false,
) => {
  const query =
    User.findById(userId);

  if (includeRefreshToken) {
    query.select(
      "+refreshToken",
    );
  }

  return query.exec();
};

/**
 * ============================================================
 * Update User Profile
 * ============================================================
 */

const updateProfile = async (
  userId,
  updateData,
) => {
  return User.findByIdAndUpdate(
    userId,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    },
  ).exec();
};

/**
 * ============================================================
 * Check Whether Email Exists
 * ============================================================
 */

const existsByEmail = async (
  email,
) => {
  return Boolean(
    await User.exists({
      email: email
        .trim()
        .toLowerCase(),
    }),
  );
};

/**
 * ============================================================
 * Update Refresh Token
 * ============================================================
 */

const updateRefreshToken = async (
  userId,
  refreshToken,
  session = null,
) => {
  return User.updateOne(
    {
      _id: userId,
    },
    {
      $set: {
        refreshToken,
      },
    },
    session
      ? { session }
      : {},
  ).exec();
};

/**
 * ============================================================
 * Clear Refresh Token
 * ============================================================
 */

const clearRefreshToken = async (
  userId,
  session = null,
) => {
  return User.updateOne(
    {
      _id: userId,
    },
    {
      $unset: {
        refreshToken: 1,
      },
    },
    session
      ? { session }
      : {},
  ).exec();
};

/**
 * ============================================================
 * Export
 * ============================================================
 */

const authRepository =
  Object.freeze({
    createUser,

    findUserByEmail,
    findUserById,

    updateProfile,

    existsByEmail,

    updateRefreshToken,
    clearRefreshToken,
  });

export default authRepository;