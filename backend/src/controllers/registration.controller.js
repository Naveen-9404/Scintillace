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
      screenshotUrl = null,
      screenshotPublicId = null,
    } = req.body;

    const result =
      await registrationService.createRegistration(
        req.user._id,
        event,
        teamId,
        screenshotUrl,
        screenshotPublicId,
      );

    return res
      .status(HTTP_STATUS.CREATED)
      .json({
        success: true,

        message:
          result.paymentRequired
            ? "Registration submitted. Your payment is pending verification."
            : "Registration created successfully.",

        data: result,
      });
  },
);

/**
 * ============================================================
 * Create Public Registration (Guest)
 * POST /api/v1/registrations/public
 * ============================================================
 */

const createPublicRegistration = asyncHandler(async (req, res) => {
  const result = await registrationService.createPublicRegistration(req.body);

  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: result.paymentRequired
      ? "Registration submitted. Your payment is pending verification."
      : "Registration created successfully.",
    data: result,
  });
});

/**
 * ============================================================
 * Get Public Registration Status (Guest)
 * GET /api/v1/registrations/public/:id/status
 * ============================================================
 */

const getPublicRegistrationStatus = asyncHandler(async (req, res) => {
  // req.registration is attached by verifyGuestToken middleware
  const { registration } = req;

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Registration status fetched successfully.",
    data: {
      registrationId: registration._id,
      participantName: registration.participantName,
      status: registration.status,
      paymentStatus: registration.paymentStatus,
      event: registration.event ? {
        name: registration.event.name,
        type: registration.event.type,
        registrationFee: registration.event.registrationFee,
        currency: registration.event.currency
      } : null,
      team: registration.team
    }
  });
});

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

      const filter = {};
      if (req.query.status) {
        filter.status = req.query.status;
      }
      if (req.query.paymentStatus) {
        filter.paymentStatus = req.query.paymentStatus;
      }
      if (req.query.event) {
        filter.event = req.query.event;
      }
      if (req.query.festival) {
        filter.festival = req.query.festival;
      }
      if (req.query.team) {
        filter.team = req.query.team;
      }

      const result =
        await registrationService.getAllRegistrations(
          {
            page,
            limit,
            filter,
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
          req.user._id,
          req.user.role,
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
 * Admin Payment Verification Flow
 * ============================================================
 */

const getPaymentByRegistration = asyncHandler(async (req, res) => {
  const payment = await registrationService.getPaymentByRegistration(
    req.params.id,
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      payment,
    },
  });
});

const approveRegistration = asyncHandler(async (req, res) => {
  const registration = await registrationService.approveRegistration(
    req.params.id,
    req.user._id
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Registration approved successfully.",
    data: {
      registration,
    },
  });
});

const rejectRegistration = asyncHandler(async (req, res) => {
  const registration = await registrationService.rejectRegistration(
    req.params.id,
    req.user._id,
    req.body.rejectionReason
  );

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Registration rejected successfully.",
    data: {
      registration,
    },
  });
});

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

/**
 * ============================================================
 * Retry Ticket Generation
 * POST /api/v1/registrations/:id/retry-tickets
 * ============================================================
 */
const retryTicketGeneration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await registrationService.retryTicketGeneration(id);

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Ticket generation retried successfully.",
    data: result,
  });
});

const registrationController =
  Object.freeze({
    createRegistration,
    createPublicRegistration,

    getAllRegistrations,

    getRegistrationById,

    getMyRegistrations,

    getRegistrationsByEvent,

    getRegistrationsByFestival,

    getRegistrationsByTeam,

    cancelRegistration,

    updateRegistrationStatus,

    updatePaymentStatus,

    getPaymentByRegistration,

    approveRegistration,

    rejectRegistration,

    checkInRegistration,

    deleteRegistration,

    getPublicRegistrationStatus,

    retryTicketGeneration,
  });

export default registrationController;