import { Festival } from "../models/index.js";

/**
 * ============================================================
 * Create Festival
 * ============================================================
 */

const createFestival = (
  festivalData,
) => {
  return Festival.create(
    festivalData,
  );
};

/**
 * ============================================================
 * Get All Festivals
 * ============================================================
 */

const getAllFestivals = ({
  filter = {},
  page = 1,
  limit = 10,
} = {}) => {
  return Festival.find(filter)
    .populate(
      "createdBy",
      "fullName email role",
    )
    .sort({
      createdAt: -1,
    })
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Festivals
 * ============================================================
 */

const countFestivals = (
  filter = {},
) => {
  return Festival.countDocuments(
    filter,
  );
};

/**
 * ============================================================
 * Get Festival By ID
 * ============================================================
 */

const getFestivalById = (
  id,
) => {
  return Festival.findById(id)
    .populate(
      "createdBy",
      "fullName email role",
    )
    .lean()
    .exec();
};

/**
 * ============================================================
 * Update Festival
 * ============================================================
 */

const updateFestival = async (
  id,
  updateData,
) => {
  /**
   * ----------------------------------------------------------
   * Get existing Festival
   * ----------------------------------------------------------
   */

  const existingFestival =
    await Festival.findById(id);

  if (!existingFestival) {
    return null;
  }

  /**
   * ----------------------------------------------------------
   * Determine final dates
   * ----------------------------------------------------------
   *
   * Supports:
   *
   * 1. Updating both dates
   * 2. Updating only startDate
   * 3. Updating only endDate
   * 4. Updating unrelated fields
   */

  const startDate =
    updateData.startDate ??
    existingFestival.startDate;

  const endDate =
    updateData.endDate ??
    existingFestival.endDate;

  /**
   * ----------------------------------------------------------
   * Validate date relationship
   * ----------------------------------------------------------
   */

  if (
    new Date(endDate) <
    new Date(startDate)
  ) {
    const error = new Error(
      "End date must be greater than or equal to the start date.",
    );

    error.statusCode = 400;

    throw error;
  }

  /**
   * ----------------------------------------------------------
   * Perform update
   * ----------------------------------------------------------
   */

  return Festival.findByIdAndUpdate(
    id,
    {
      ...updateData,
      startDate,
      endDate,
    },
    {
      new: true,
      runValidators: true,
    },
  )
    .populate(
      "createdBy",
      "fullName email role",
    )
    .exec();
};

/**
 * ============================================================
 * Delete Festival
 * ============================================================
 */

const deleteFestival = (
  id,
) => {
  return Festival.findByIdAndDelete(
    id,
  ).exec();
};

/**
 * ============================================================
 * Festival Exists
 * ============================================================
 */

const festivalExists = (
  id,
) => {
  return Festival.exists({
    _id: id,
  });
};

/**
 * ============================================================
 * Repository Export
 * ============================================================
 */

const festivalRepository =
  Object.freeze({
    createFestival,
    getAllFestivals,
    countFestivals,
    getFestivalById,
    updateFestival,
    deleteFestival,
    festivalExists,
  });

export default festivalRepository;