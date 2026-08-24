import registrationService from "../services/registration.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Create Registration
 * POST /api/v1/registrations
 *
 * Body:
 * {
 *   "event": "EVENT_ID",
 *   "teamId": "TEAM_ID" // required for TEAM events
 * }
 * ============================================================
 */

const createRegistration = asyncHandler(
  async (req, res) => {
    const {
      event,
      teamId = null,
    } = req.body;

    const result =
      await registrationService.createRegistration(
        req.user._id,
        event,
        teamId,
      );

    return res
      .status(HTTP_STATUS.CREATED)
      .json({
        success: true,

        message:
          result.paymentRequired
            ? "Registration created. Payment is required."
            : "Registration created successfully.",

        data: result,
      });
  },
);

/**
 * ============================================================
 * Get All Registrations
 * GET /api/v1/registrations
 * ============================================================
 */

const getAllRegistrations =
  asyncHandler(
    async (req, res) => {
      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 10;

      const result =
        await registrationService.getAllRegistrations(
          {
            page,
            limit,
          },
        );

      return res
        .status(HTTP_STATUS.OK)
        .json({
          success: true,

          data: {
            registrations:
              result.registrations,

            pagination:
              result.pagination,
          },
        });
    },
  );

/**
 * ============================================================
 * Get Registration By ID
 * GET /api/v1/registrations/:id
 * ============================================================
 */

const getRegistrationById =
  asyncHandler(
    async (req, res) => {
      const registration =
        await registrationService.getRegistrationById(
          req.params.id,
        );

      return res
        .status(HTTP_STATUS.OK)
        .json({
          success: true,

          data: {
            registration,
          },
        });
    },
  );

/**
 * ============================================================
 * Get My Registrations
 * GET /api/v1/registrations/my
 * ============================================================
 */

const getMyRegistrations =
  asyncHandler(
    async (req, res) => {
      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 10;

      const registrations =
        await registrationService.getMyRegistrations(
          req.user._id,
          {
            page,
            limit,
          },
        );

      return res
        .status(HTTP_STATUS.OK)
        .json({
          success: true,

          data: {
            registrations,
          },
        });
    },
  );

/**
 * ============================================================
 * Get Registrations By Event
 * GET /api/v1/registrations/event/:eventId
 * ============================================================
 */

const getRegistrationsByEvent =
  asyncHandler(
    async (req, res) => {
      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 10;

      const registrations =
        await registrationService.getRegistrationsByEvent(
          req.params.eventId,
          {
            page,
            limit,
          },
        );

      return res
        .status(HTTP_STATUS.OK)
        .json({
          success: true,

          data: {
            registrations,
          },
        });
    },
  );

/**
 * ============================================================
 * Get Registrations By Festival
 * GET /api/v1/registrations/festival/:festivalId
 * ============================================================
 */

const getRegistrationsByFestival =
  asyncHandler(
    async (req, res) => {
      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 10;

      const registrations =
        await registrationService.getRegistrationsByFestival(
          req.params.festivalId,
          {
            page,
            limit,
          },
        );

      return res
        .status(HTTP_STATUS.OK)
        .json({
          success: true,

          data: {
            registrations,
          },
        });
    },
  );

/**
 * ============================================================
 * Get Registrations By Team
 * GET /api/v1/registrations/team/:teamId
 * ============================================================
 */

const getRegistrationsByTeam =
  asyncHandler(
    async (req, res) => {
      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 10;

      const registrations =
        await registrationService.getRegistrationsByTeam(
          req.params.teamId,
          {
            page,
            limit,
          },
        );

      return res
        .status(HTTP_STATUS.OK)
        .json({
          success: true,

          data: {
            registrations,
          },
        });
    },
  );

/**
 * ============================================================
 * Cancel Registration
 * POST /api/v1/registrations/:id/cancel
 *
 * This is a logical cancellation.
 * It does NOT permanently delete the record.
 * ============================================================
 */

const cancelRegistration =
  asyncHandler(
    async (req, res) => {
      const registration =
        await registrationService.cancelRegistration(
          req.params.id,
          req.user._id,
        );

      return res
        .status(HTTP_STATUS.OK)
        .json({
          success: true,

          message:
            "Registration cancelled successfully.",

          data: {
            registration,
          },
        });
    },
  );

/**
 * ============================================================
 * Update Registration Status
 * PATCH /api/v1/registrations/:id/status
 * ============================================================
 */

const updateRegistrationStatus =
  asyncHandler(
    async (req, res) => {
      const registration =
        await registrationService.updateRegistrationStatus(
          req.params.id,
          req.body.status,
        );

      return res
        .status(HTTP_STATUS.OK)
        .json({
          success: true,

          message:
            "Registration status updated successfully.",

          data: {
            registration,
          },
        });
    },
  );

/**
 * ============================================================
 * Update Payment Status
 * PATCH /api/v1/registrations/:id/payment-status
 *
 * Primarily used internally by the payment module.
 * ============================================================
 */

const updatePaymentStatus =
  asyncHandler(
    async (req, res) => {
      const registration =
        await registrationService.updatePaymentStatus(
          req.params.id,
          req.body.paymentStatus,
        );

      return res
        .status(HTTP_STATUS.OK)
        .json({
          success: true,

          message:
            "Payment status updated successfully.",

          data: {
            registration,
          },
        });
    },
  );

/**
 * ============================================================
 * Check In Registration
 * PATCH /api/v1/registrations/:id/check-in
 * ============================================================
 */

const checkInRegistration =
  asyncHandler(
    async (req, res) => {
      const registration =
        await registrationService.checkInRegistration(
          req.params.id,
        );

      return res
        .status(HTTP_STATUS.OK)
        .json({
          success: true,

          message:
            "Participant checked in successfully.",

          data: {
            registration,
          },
        });
    },
  );

/**
 * ============================================================
 * Permanently Delete Registration
 * DELETE /api/v1/registrations/:id/permanent
 *
 * Administrative cleanup only.
 * ============================================================
 */

const deleteRegistration =
  asyncHandler(
    async (req, res) => {
      const result =
        await registrationService.deleteRegistration(
          req.params.id,
        );

      return res
        .status(HTTP_STATUS.OK)
        .json({
          success: true,

          message:
            result.message,
        });
    },
  );

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

const registrationController =
  Object.freeze({
    createRegistration,

    getAllRegistrations,

    getRegistrationById,

    getMyRegistrations,

    getRegistrationsByEvent,

    getRegistrationsByFestival,

    getRegistrationsByTeam,

    cancelRegistration,

    updateRegistrationStatus,

    updatePaymentStatus,

    checkInRegistration,

    deleteRegistration,
  });

export default registrationController;