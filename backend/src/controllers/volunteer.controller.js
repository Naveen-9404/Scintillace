import volunteerService from "../services/volunteer.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Pagination Helper
 * ============================================================
 */

const getPagination = (req) => ({
  page: Number(req.query.page) || 1,

  limit: Number(req.query.limit) || 10,
});

/**
 * ============================================================
 * Create Volunteer Assignment
 * ============================================================
 *
 * POST /api/v1/volunteers
 */

const createVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.createVolunteer(
    req.body,
    req.user.id,
  );

  return ApiResponse.success(
    res,
    {
      volunteer,
    },
    "Volunteer assignment created successfully.",
    HTTP_STATUS.CREATED,
  );
});

/**
 * ============================================================
 * Get All Volunteers
 * ============================================================
 *
 * GET /api/v1/volunteers
 */

const getAllVolunteers = asyncHandler(async (req, res) => {
  const pagination = getPagination(req);

  const result = await volunteerService.getAllVolunteers(pagination);

  return ApiResponse.success(
    res,
    {
      volunteers: result.volunteers,

      pagination: result.pagination,
    },
    "Volunteers fetched successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Get Volunteer By ID
 * ============================================================
 *
 * GET /api/v1/volunteers/:id
 */

const getVolunteerById = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.getVolunteerById(req.params.id);

  return ApiResponse.success(
    res,
    {
      volunteer,
    },
    "Volunteer assignment fetched successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Get My Volunteer Assignments
 * ============================================================
 *
 * GET /api/v1/volunteers/me
 */

const getMyVolunteerAssignments = asyncHandler(async (req, res) => {
  const volunteers = await volunteerService.getMyVolunteerAssignments(
    req.user.id,
  );

  return ApiResponse.success(
    res,
    {
      volunteers,
    },
    "Volunteer assignments fetched successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Get Volunteers By Festival
 * ============================================================
 *
 * GET /api/v1/volunteers/festival/:festivalId
 */

const getVolunteersByFestival = asyncHandler(async (req, res) => {
  const pagination = getPagination(req);

  const result = await volunteerService.getVolunteersByFestival(
    req.params.festivalId,
    pagination,
  );

  return ApiResponse.success(
    res,
    {
      volunteers: result.volunteers,

      pagination: result.pagination,
    },
    "Festival volunteers fetched successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Get Volunteers By Event
 * ============================================================
 *
 * GET /api/v1/volunteers/event/:eventId
 */

const getVolunteersByEvent = asyncHandler(async (req, res) => {
  const pagination = getPagination(req);

  const result = await volunteerService.getVolunteersByEvent(
    req.params.eventId,
    pagination,
  );

  return ApiResponse.success(
    res,
    {
      volunteers: result.volunteers,

      pagination: result.pagination,
    },
    "Event volunteers fetched successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Get Volunteers By Status
 * ============================================================
 *
 * GET /api/v1/volunteers/status/:status
 */

const getVolunteersByStatus = asyncHandler(async (req, res) => {
  const pagination = getPagination(req);

  const result = await volunteerService.getVolunteersByStatus(
    req.params.status,
    pagination,
  );

  return ApiResponse.success(
    res,
    {
      volunteers: result.volunteers,

      pagination: result.pagination,
    },
    "Volunteers fetched successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Get Active Volunteers
 * ============================================================
 *
 * GET /api/v1/volunteers/active
 */

const getActiveVolunteers = asyncHandler(async (req, res) => {
  const pagination = getPagination(req);

  const result = await volunteerService.getActiveVolunteers({
    festivalId: req.query.festivalId || null,

    eventId: req.query.eventId || null,

    ...pagination,
  });

  return ApiResponse.success(
    res,
    {
      volunteers: result.volunteers,

      pagination: result.pagination,
    },
    "Active volunteers fetched successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Update Volunteer
 * ============================================================
 *
 * PUT /api/v1/volunteers/:id
 */

const updateVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.updateVolunteer(
    req.params.id,
    req.body,
    req.user.id,
  );

  return ApiResponse.success(
    res,
    {
      volunteer,
    },
    "Volunteer assignment updated successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Delete Volunteer
 * ============================================================
 *
 * DELETE /api/v1/volunteers/:id
 */

const deleteVolunteer = asyncHandler(async (req, res) => {
  const result = await volunteerService.deleteVolunteer(req.params.id);

  return ApiResponse.success(res, null, result.message, HTTP_STATUS.OK);
});

/**
 * ============================================================
 * Approve Volunteer
 * ============================================================
 *
 * PATCH /api/v1/volunteers/:id/approve
 */

const approveVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.approveVolunteer(
    req.params.id,
    req.user.id,
  );

  return ApiResponse.success(
    res,
    {
      volunteer,
    },
    "Volunteer approved successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Reject Volunteer
 * ============================================================
 *
 * PATCH /api/v1/volunteers/:id/reject
 */

const rejectVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.rejectVolunteer(
    req.params.id,
    req.user.id,
  );

  return ApiResponse.success(
    res,
    {
      volunteer,
    },
    "Volunteer rejected successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Activate Volunteer
 * ============================================================
 *
 * PATCH /api/v1/volunteers/:id/activate
 */

const activateVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.activateVolunteer(
    req.params.id,
    req.user.id,
  );

  return ApiResponse.success(
    res,
    {
      volunteer,
    },
    "Volunteer activated successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Cancel Volunteer Assignment
 * ============================================================
 *
 * PATCH /api/v1/volunteers/:id/cancel
 */

const cancelVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.cancelVolunteer(
    req.params.id,
    req.user.id,
  );

  return ApiResponse.success(
    res,
    {
      volunteer,
    },
    "Volunteer assignment cancelled successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Complete Volunteer
 * ============================================================
 *
 * PATCH /api/v1/volunteers/:id/complete
 */

const completeVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.completeVolunteer(
    req.params.id,
    req.user.id,
  );

  return ApiResponse.success(
    res,
    {
      volunteer,
    },
    "Volunteer assignment completed successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Check In Volunteer
 * ============================================================
 *
 * PATCH /api/v1/volunteers/:id/check-in
 */

const checkInVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.checkInVolunteer(
    req.params.id,
    req.user.id,
    req.user.role,
  );

  return ApiResponse.success(
    res,
    {
      volunteer,
    },
    "Volunteer checked in successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Check Out Volunteer
 * ============================================================
 *
 * PATCH /api/v1/volunteers/:id/check-out
 */

const checkOutVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await volunteerService.checkOutVolunteer(
    req.params.id,
    req.user.id,
    req.user.role,
  );

  return ApiResponse.success(
    res,
    {
      volunteer,
    },
    "Volunteer checked out successfully.",
    HTTP_STATUS.OK,
  );
});

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

const volunteerController = Object.freeze({
  createVolunteer,

  getAllVolunteers,
  getVolunteerById,
  getMyVolunteerAssignments,

  getVolunteersByFestival,
  getVolunteersByEvent,
  getVolunteersByStatus,
  getActiveVolunteers,

  updateVolunteer,
  deleteVolunteer,

  approveVolunteer,
  rejectVolunteer,
  activateVolunteer,
  cancelVolunteer,
  completeVolunteer,

  checkInVolunteer,
  checkOutVolunteer,
});

export default volunteerController;
