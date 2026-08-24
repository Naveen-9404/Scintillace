import festivalService from '../services/festival.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import HTTP_STATUS from '../constants/httpStatus.js';

const createFestival = asyncHandler(async (req, res) => {
  const festival = await festivalService.createFestival(
    req.body,
    req.user,
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Festival created successfully.',
    data: {
      festival,
    },
  });
});

const getAllFestivals = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const result = await festivalService.getAllFestivals({
    page,
    limit,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      festivals: result.festivals,
      pagination: result.pagination,
    },
  });
});

const getFestivalById = asyncHandler(async (req, res) => {
  const festival = await festivalService.getFestivalById(
    req.params.id,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      festival,
    },
  });
});

const updateFestival = asyncHandler(async (req, res) => {
  const festival = await festivalService.updateFestival(
    req.params.id,
    req.body,
    req.user,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Festival updated successfully.',
    data: {
      festival,
    },
  });
});

const deleteFestival = asyncHandler(async (req, res) => {
  const result = await festivalService.deleteFestival(
    req.params.id,
    req.user,
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: result.message,
  });
});

const festivalController = Object.freeze({
  createFestival,
  getAllFestivals,
  getFestivalById,
  updateFestival,
  deleteFestival,
});

export default festivalController;