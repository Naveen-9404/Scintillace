import mongoose from "mongoose";

import volunteerRepository from "../repositories/volunteer.repository.js";

import ApiError from "../utils/ApiError.js";

import HTTP_STATUS from "../constants/httpStatus.js";
import ROLES from "../constants/roles.js";

/**
 * ============================================================
 * Helpers
 * ============================================================
 */

/**
 * Validate MongoDB ObjectId.
 */

const validateObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(`Invalid ${label}.`, HTTP_STATUS.BAD_REQUEST);
  }
};

/**
 * Normalize pagination values.
 */

const normalizePagination = ({ page = 1, limit = 10 } = {}) => ({
  page: Math.max(1, Number(page) || 1),

  limit: Math.min(100, Math.max(1, Number(limit) || 10)),
});

/**
 * Build pagination response.
 */

const buildPagination = ({ page, limit, total }) => ({
  page,
  limit,
  total,

  totalPages: total === 0 ? 0 : Math.ceil(total / limit),
});

const assertVolunteerSelfServiceOwnership = (volunteer, actorId, actorRole) => {
  if (actorRole !== ROLES.VOLUNTEER) {
    return;
  }

  const assignmentUserId = volunteer.user?._id || volunteer.user;

  if (!assignmentUserId || assignmentUserId.toString() !== actorId.toString()) {
    throw new ApiError(
      "Volunteers can only update their own assignment.",
      HTTP_STATUS.FORBIDDEN,
    );
  }
};

/**
 * Validate assignment references.
 */

const validateAssignmentReferences = ({
  user,
  festival = null,
  event = null,
}) => {
  validateObjectId(user, "User ID");

  if (festival) {
    validateObjectId(festival, "Festival ID");
  }

  if (event) {
    validateObjectId(event, "Event ID");
  }

  if (!festival && !event) {
    throw new ApiError(
      "Volunteer assignment must be associated with a festival or event.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

/**
 * ============================================================
 * Create Volunteer Assignment
 * ============================================================
 */

const createVolunteer = async (volunteerData, assignedBy) => {
  const { user, festival = null, event = null } = volunteerData;

  validateAssignmentReferences({
    user,
    festival,
    event,
  });

  validateObjectId(assignedBy, "Assigning user ID");

  const duplicate = await volunteerRepository.assignmentExists({
    user,
    festival,
    event,
  });

  if (duplicate) {
    throw new ApiError(
      "This user is already assigned as a volunteer for this festival or event.",
      HTTP_STATUS.CONFLICT,
    );
  }

  return volunteerRepository.create({
    ...volunteerData,
    assignedBy,
    updatedBy: assignedBy,
  });
};

/**
 * ============================================================
 * Get Volunteer By ID
 * ============================================================
 */

const getVolunteerById = async (volunteerId) => {
  validateObjectId(volunteerId, "Volunteer ID");

  const volunteer = await volunteerRepository.findById(volunteerId);

  if (!volunteer) {
    throw new ApiError(
      "Volunteer assignment not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  return volunteer;
};

/**
 * ============================================================
 * Get My Volunteer Assignments
 * ============================================================
 */

const getMyVolunteerAssignments = async (userId) => {
  validateObjectId(userId, "User ID");

  return volunteerRepository.findByUser(userId);
};

/**
 * ============================================================
 * Get All Volunteers
 * ============================================================
 */

const getAllVolunteers = async ({ filter = {}, page = 1, limit = 10 } = {}) => {
  const pagination = normalizePagination({
    page,
    limit,
  });

  const [volunteers, total] = await Promise.all([
    volunteerRepository.findAll({
      filter,
      ...pagination,
    }),

    volunteerRepository.count(filter),
  ]);

  return {
    volunteers,

    pagination: buildPagination({
      ...pagination,
      total,
    }),
  };
};

/**
 * ============================================================
 * Get Volunteers By Festival
 * ============================================================
 */

const getVolunteersByFestival = async (
  festivalId,
  { page = 1, limit = 10 } = {},
) => {
  validateObjectId(festivalId, "Festival ID");

  const pagination = normalizePagination({
    page,
    limit,
  });

  const [volunteers, total] = await Promise.all([
    volunteerRepository.getByFestival(festivalId, pagination),

    volunteerRepository.countByFestival(festivalId),
  ]);

  return {
    volunteers,

    pagination: buildPagination({
      ...pagination,
      total,
    }),
  };
};

/**
 * ============================================================
 * Get Volunteers By Event
 * ============================================================
 */

const getVolunteersByEvent = async (eventId, { page = 1, limit = 10 } = {}) => {
  validateObjectId(eventId, "Event ID");

  const pagination = normalizePagination({
    page,
    limit,
  });

  const [volunteers, total] = await Promise.all([
    volunteerRepository.getByEvent(eventId, pagination),

    volunteerRepository.countByEvent(eventId),
  ]);

  return {
    volunteers,

    pagination: buildPagination({
      ...pagination,
      total,
    }),
  };
};

/**
 * ============================================================
 * Get Volunteers By Status
 * ============================================================
 *
 * Useful for administrative dashboards.
 */

const getVolunteersByStatus = async (status, { page = 1, limit = 10 } = {}) => {
  if (!status) {
    throw new ApiError(
      "Volunteer status is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const pagination = normalizePagination({
    page,
    limit,
  });

  const volunteers = await volunteerRepository.getByStatus(status, pagination);

  const total = await volunteerRepository.count({
    status,
  });

  return {
    volunteers,

    pagination: buildPagination({
      ...pagination,
      total,
    }),
  };
};

/**
 * ============================================================
 * Get Active Volunteers
 * ============================================================
 */

const getActiveVolunteers = async ({
  festivalId = null,
  eventId = null,
  page = 1,
  limit = 10,
} = {}) => {
  if (festivalId) {
    validateObjectId(festivalId, "Festival ID");
  }

  if (eventId) {
    validateObjectId(eventId, "Event ID");
  }

  const pagination = normalizePagination({
    page,
    limit,
  });

  const filter = {
    status: "ACTIVE",
  };

  if (festivalId) {
    filter.festival = festivalId;
  }

  if (eventId) {
    filter.event = eventId;
  }

  const [volunteers, total] = await Promise.all([
    volunteerRepository.getActive({
      festivalId,
      eventId,
      ...pagination,
    }),

    volunteerRepository.count(filter),
  ]);

  return {
    volunteers,

    pagination: buildPagination({
      ...pagination,
      total,
    }),
  };
};

/**
 * ============================================================
 * Update Volunteer
 * ============================================================
 */

const updateVolunteer = async (volunteerId, updateData, updatedBy) => {
  validateObjectId(volunteerId, "Volunteer ID");

  validateObjectId(updatedBy, "Updating user ID");

  const existing = await volunteerRepository.findByIdRaw(volunteerId);

  if (!existing) {
    throw new ApiError(
      "Volunteer assignment not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const finalUser =
    updateData.user !== undefined ? updateData.user : existing.user;

  const finalFestival =
    updateData.festival !== undefined ? updateData.festival : existing.festival;

  const finalEvent =
    updateData.event !== undefined ? updateData.event : existing.event;

  validateAssignmentReferences({
    user: finalUser,
    festival: finalFestival,
    event: finalEvent,
  });

  /**
   * Prevent duplicate assignment when changing
   * user/festival/event.
   */

  const duplicate = await volunteerRepository.assignmentExists({
    user: finalUser,
    festival: finalFestival,
    event: finalEvent,
    excludeId: volunteerId,
  });

  if (duplicate) {
    throw new ApiError(
      "Another volunteer assignment already exists for this user and festival/event.",
      HTTP_STATUS.CONFLICT,
    );
  }

  return volunteerRepository.updateById(volunteerId, {
    ...updateData,
    updatedBy,
  });
};

/**
 * ============================================================
 * Delete Volunteer
 * ============================================================
 */

const deleteVolunteer = async (volunteerId) => {
  validateObjectId(volunteerId, "Volunteer ID");

  const existing = await volunteerRepository.findByIdRaw(volunteerId);

  if (!existing) {
    throw new ApiError(
      "Volunteer assignment not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  await volunteerRepository.deleteById(volunteerId);

  return {
    message: "Volunteer assignment deleted successfully.",
  };
};

/**
 * ============================================================
 * Approve Volunteer
 * ============================================================
 */

const approveVolunteer = async (volunteerId, updatedBy) => {
  validateObjectId(volunteerId, "Volunteer ID");

  validateObjectId(updatedBy, "Updating user ID");

  const existing = await volunteerRepository.findByIdRaw(volunteerId);

  if (!existing) {
    throw new ApiError(
      "Volunteer assignment not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  if (existing.status !== "PENDING") {
    throw new ApiError(
      `Volunteer assignment cannot be approved from ${existing.status} status.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return volunteerRepository.updateById(volunteerId, {
    status: "APPROVED",
    updatedBy,
  });
};

/**
 * ============================================================
 * Activate Volunteer
 * ============================================================
 */

const activateVolunteer = async (volunteerId, updatedBy) => {
  validateObjectId(volunteerId, "Volunteer ID");

  validateObjectId(updatedBy, "Updating user ID");

  const existing = await volunteerRepository.findByIdRaw(volunteerId);

  if (!existing) {
    throw new ApiError(
      "Volunteer assignment not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  if (existing.status !== "APPROVED") {
    throw new ApiError(
      `Volunteer assignment cannot be activated from ${existing.status} status.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return volunteerRepository.updateById(volunteerId, {
    status: "ACTIVE",
    updatedBy,
  });
};

/**
 * ============================================================
 * Complete Volunteer Assignment
 * ============================================================
 */

const completeVolunteer = async (volunteerId, updatedBy) => {
  validateObjectId(volunteerId, "Volunteer ID");

  validateObjectId(updatedBy, "Updating user ID");

  const existing = await volunteerRepository.findByIdRaw(volunteerId);

  if (!existing) {
    throw new ApiError(
      "Volunteer assignment not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  if (existing.status !== "ACTIVE") {
    throw new ApiError(
      `Volunteer assignment cannot be completed from ${existing.status} status.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (!existing.checkedOut) {
    throw new ApiError(
      "Volunteer must be checked out before the assignment can be completed.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return volunteerRepository.updateById(volunteerId, {
    status: "COMPLETED",
    updatedBy,
  });
};

/**
 * ============================================================
 * Check In Volunteer
 * ============================================================
 */

const checkInVolunteer = async (volunteerId, updatedBy, actorRole) => {
  validateObjectId(volunteerId, "Volunteer ID");

  validateObjectId(updatedBy, "Updating user ID");

  const existing = await volunteerRepository.findByIdRaw(volunteerId);

  if (!existing) {
    throw new ApiError(
      "Volunteer assignment not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  assertVolunteerSelfServiceOwnership(existing, updatedBy, actorRole);

  if (existing.status !== "ACTIVE") {
    throw new ApiError(
      "Only active volunteers can be checked in.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (existing.checkedIn) {
    throw new ApiError(
      "Volunteer is already checked in.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return volunteerRepository.updateById(volunteerId, {
    checkedIn: true,
    checkedInAt: new Date(),
    updatedBy,
  });
};

/**
 * ============================================================
 * Check Out Volunteer
 * ============================================================
 */

const checkOutVolunteer = async (volunteerId, updatedBy, actorRole) => {
  validateObjectId(volunteerId, "Volunteer ID");

  validateObjectId(updatedBy, "Updating user ID");

  const existing = await volunteerRepository.findByIdRaw(volunteerId);

  if (!existing) {
    throw new ApiError(
      "Volunteer assignment not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  assertVolunteerSelfServiceOwnership(existing, updatedBy, actorRole);

  if (existing.status !== "ACTIVE") {
    throw new ApiError(
      "Only active volunteers can be checked out.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (!existing.checkedIn) {
    throw new ApiError(
      "Volunteer must be checked in before checking out.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (existing.checkedOut) {
    throw new ApiError(
      "Volunteer is already checked out.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return volunteerRepository.updateById(volunteerId, {
    checkedOut: true,
    checkedOutAt: new Date(),
    updatedBy,
  });
};

/**
 * ============================================================
 * Reject Volunteer
 * ============================================================
 */

const rejectVolunteer = async (volunteerId, updatedBy) => {
  validateObjectId(volunteerId, "Volunteer ID");

  validateObjectId(updatedBy, "Updating user ID");

  const existing = await volunteerRepository.findByIdRaw(volunteerId);

  if (!existing) {
    throw new ApiError(
      "Volunteer assignment not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  if (existing.status !== "PENDING") {
    throw new ApiError(
      `Volunteer assignment cannot be rejected from ${existing.status} status.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return volunteerRepository.updateById(volunteerId, {
    status: "REJECTED",
    updatedBy,
  });
};

/**
 * ============================================================
 * Cancel Volunteer Assignment
 * ============================================================
 */

const cancelVolunteer = async (volunteerId, updatedBy) => {
  validateObjectId(volunteerId, "Volunteer ID");

  validateObjectId(updatedBy, "Updating user ID");

  const existing = await volunteerRepository.findByIdRaw(volunteerId);

  if (!existing) {
    throw new ApiError(
      "Volunteer assignment not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  if (["COMPLETED", "CANCELLED", "REJECTED"].includes(existing.status)) {
    throw new ApiError(
      `Volunteer assignment cannot be cancelled from ${existing.status} status.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return volunteerRepository.updateById(volunteerId, {
    status: "CANCELLED",
    updatedBy,
  });
};

/**
 * ============================================================
 * Service Export
 * ============================================================
 */

const volunteerService = Object.freeze({
  createVolunteer,

  getVolunteerById,
  getMyVolunteerAssignments,
  getAllVolunteers,

  getVolunteersByFestival,
  getVolunteersByEvent,
  getVolunteersByStatus,
  getActiveVolunteers,

  updateVolunteer,
  deleteVolunteer,

  approveVolunteer,
  activateVolunteer,
  rejectVolunteer,
  cancelVolunteer,
  completeVolunteer,

  checkInVolunteer,
  checkOutVolunteer,
});

export default volunteerService;
