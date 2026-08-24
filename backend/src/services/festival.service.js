import festivalRepository from '../repositories/festival.repository.js';
import HTTP_STATUS from '../constants/httpStatus.js';
import ROLES from '../constants/roles.js';
import ApiError from '../utils/ApiError.js';

const allowedRoles = [
  ROLES.FACULTY,
  ROLES.SUPER_ADMIN,
];

const checkPermission = (user) => {
  if (!user) {
    throw new ApiError(
      'Authentication required',
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(
      'You are not authorized to perform this action',
      HTTP_STATUS.FORBIDDEN,
    );
  }
};

const validateDates = (startDate, endDate) => {
  if (new Date(endDate) < new Date(startDate)) {
    throw new ApiError(
      'End date must be after start date',
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

const createFestival = async (festivalData, user) => {
  checkPermission(user);

  validateDates(
    festivalData.startDate,
    festivalData.endDate,
  );

  return festivalRepository.createFestival({
    ...festivalData,
    createdBy: user._id,
  });
};

const getAllFestivals = async ({
  page = 1,
  limit = 10,
} = {}) => {
  const festivals =
    await festivalRepository.getAllFestivals({
      page,
      limit,
    });

  const total =
    await festivalRepository.countFestivals();

  return {
    festivals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getFestivalById = async (id) => {
  const festival =
    await festivalRepository.getFestivalById(id);

  if (!festival) {
    throw new ApiError(
      'Festival not found',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  return festival;
};

const updateFestival = async (
  id,
  updateData,
  user,
) => {
  checkPermission(user);

  const existingFestival =
    await festivalRepository.getFestivalById(id);

  if (!existingFestival) {
    throw new ApiError(
      'Festival not found',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const startDate =
    updateData.startDate ??
    existingFestival.startDate;

  const endDate =
    updateData.endDate ??
    existingFestival.endDate;

  validateDates(startDate, endDate);

  return festivalRepository.updateFestival(
    id,
    updateData,
  );
};

const deleteFestival = async (
  id,
  user,
) => {
  checkPermission(user);

  const existingFestival =
    await festivalRepository.getFestivalById(id);

  if (!existingFestival) {
    throw new ApiError(
      'Festival not found',
      HTTP_STATUS.NOT_FOUND,
    );
  }

  await festivalRepository.deleteFestival(id);

  return {
    success: true,
    message: 'Festival deleted successfully',
  };
};

const festivalService = Object.freeze({
  createFestival,
  getAllFestivals,
  getFestivalById,
  updateFestival,
  deleteFestival,
});

export default festivalService;