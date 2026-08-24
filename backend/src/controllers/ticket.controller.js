import ticketService from "../services/ticket.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Pagination Helper
 * ============================================================
 */

const getPagination = (req) => {
  const page = Number(req.query.page) || 1;

  const limit = Number(req.query.limit) || 10;

  return {
    page,
    limit,
  };
};

/**
 * ============================================================
 * Public Ticket Response
 * ============================================================
 */

const toPublicTicket = (ticket) => ({
  id: ticket.id || ticket._id,

  ticketNumber:
    ticket.ticketNumber,

  status:
    ticket.status,

  checkedIn:
    ticket.checkedIn,

  checkedInAt:
    ticket.checkedInAt,

  event:
    ticket.event,

  festival:
    ticket.festival,

  expiresAt:
    ticket.expiresAt,
});

/**
 * ============================================================
 * Safe Ticket Response
 * ============================================================
 *
 * Never expose qrToken.
 */

const toSafeTicket = (ticket) => {
  const ticketData =
    typeof ticket.toObject === "function"
      ? ticket.toObject()
      : { ...ticket };

  delete ticketData.qrToken;

  return ticketData;
};

/**
 * ============================================================
 * Create Ticket
 * ============================================================
 *
 * POST /api/v1/tickets
 *
 * Protected:
 * Super Admin / Faculty
 */

const createTicket = asyncHandler(
  async (req, res) => {
    const ticket =
      await ticketService.createTicket(
        req.body,
        req.user.id,
      );

    return ApiResponse.success(
      res,
      {
        ticket:
          toSafeTicket(ticket),
      },
      "Ticket created successfully.",
      HTTP_STATUS.CREATED,
    );
  },
);

/**
 * ============================================================
 * Get Ticket QR
 * ============================================================
 *
 * GET /api/v1/tickets/:id/qr
 */

const getTicketQR = asyncHandler(
  async (req, res) => {
    const ticketQR =
      await ticketService.getTicketQR(
        req.params.id,
        req.user.id,
        req.user.role,
      );

    return ApiResponse.success(
      res,
      {
        ticketQR,
      },
      "Ticket QR code generated successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Get Ticket By ID
 * ============================================================
 *
 * GET /api/v1/tickets/:id
 */

const getTicketById = asyncHandler(
  async (req, res) => {
    const ticket =
      await ticketService.getTicketById(
        req.params.id,
      );

    return ApiResponse.success(
      res,
      {
        ticket,
      },
      "Ticket fetched successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Get Ticket By Number
 * ============================================================
 *
 * GET /api/v1/tickets/number/:ticketNumber
 */

const getTicketByNumber = asyncHandler(
  async (req, res) => {
    const ticket =
      await ticketService.getTicketByNumber(
        req.params.ticketNumber,
      );

    return ApiResponse.success(
      res,
      {
        ticket:
          toPublicTicket(ticket),
      },
      "Ticket fetched successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Verify Ticket QR
 * ============================================================
 *
 * POST /api/v1/tickets/verify
 *
 * Body:
 *
 * {
 *   "qrPayload": "{\"type\":\"SCINTILLACE_TICKET\",...}"
 * }
 *
 * Public verification.
 *
 * IMPORTANT:
 * Verification does NOT check the participant in.
 * Check-in remains a separate operation.
 */

const verifyQrToken = asyncHandler(
  async (req, res) => {
    const {
      qrPayload,
    } = req.body;

    const ticket =
      await ticketService.verifyQrToken(
        qrPayload,
      );

    return ApiResponse.success(
      res,
      {
        ticket:
          toPublicTicket(ticket),

        valid: true,
      },
      "Ticket QR code verified successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Get My Tickets
 * ============================================================
 *
 * GET /api/v1/tickets/me
 *
 * Protected:
 * Authenticated user
 */

const getMyTickets = asyncHandler(
  async (req, res) => {
    const pagination =
      getPagination(req);

    const result =
      await ticketService.getMyTickets(
        req.user.id,
        pagination,
      );

    return ApiResponse.success(
      res,
      {
        tickets:
          result.tickets,

        pagination:
          result.pagination,
      },
      "Your tickets fetched successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Get All Tickets
 * ============================================================
 *
 * GET /api/v1/tickets
 *
 * Protected:
 * Super Admin / Faculty
 */

const getAllTickets = asyncHandler(
  async (req, res) => {
    const pagination =
      getPagination(req);

    const result =
      await ticketService.getAllTickets({
        page:
          pagination.page,

        limit:
          pagination.limit,
      });

    return ApiResponse.success(
      res,
      {
        tickets:
          result.tickets,

        pagination:
          result.pagination,
      },
      "Tickets fetched successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Get Tickets By Event
 * ============================================================
 *
 * GET /api/v1/tickets/event/:eventId
 */

const getTicketsByEvent = asyncHandler(
  async (req, res) => {
    const pagination =
      getPagination(req);

    const result =
      await ticketService.getTicketsByEvent(
        req.params.eventId,
        pagination,
      );

    return ApiResponse.success(
      res,
      {
        tickets:
          result.tickets,

        pagination:
          result.pagination,
      },
      "Event tickets fetched successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Get Tickets By Festival
 * ============================================================
 *
 * GET /api/v1/tickets/festival/:festivalId
 */

const getTicketsByFestival = asyncHandler(
  async (req, res) => {
    const pagination =
      getPagination(req);

    const result =
      await ticketService.getTicketsByFestival(
        req.params.festivalId,
        pagination,
      );

    return ApiResponse.success(
      res,
      {
        tickets:
          result.tickets,

        pagination:
          result.pagination,
      },
      "Festival tickets fetched successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Check In Ticket
 * ============================================================
 *
 * PATCH /api/v1/tickets/:id/check-in
 *
 * Protected:
 *
 * - SUPER_ADMIN
 * - FACULTY
 * - VOLUNTEER
 *
 * Authorization:
 *
 * SUPER_ADMIN
 *   → Can check in tickets for any event.
 *
 * FACULTY
 *   → Can check in tickets for any event.
 *
 * VOLUNTEER
 *   → Can check in tickets only for an event to which
 *     the volunteer is actively assigned.
 */

const checkInTicket = asyncHandler(
  async (req, res) => {
    const ticket =
      await ticketService.checkInTicket(
        req.params.id,
        req.user.id,
        req.user.role,
      );

    return ApiResponse.success(
      res,
      {
        ticket,
      },
      "Ticket checked in successfully.",
      HTTP_STATUS.OK,
    );
  },
);
/**
 * ============================================================
 * Expire Ticket
 * ============================================================
 *
 * PATCH /api/v1/tickets/:id/expire
 *
 * Protected:
 * Super Admin / Faculty
 */

const expireTicket = asyncHandler(
  async (req, res) => {
    const ticket =
      await ticketService.expireTicket(
        req.params.id,
      );

    return ApiResponse.success(
      res,
      {
        ticket,
      },
      "Ticket expired successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Get Event Check-In List
 * ============================================================
 *
 * GET /api/v1/tickets/event/:eventId/check-ins
 */

const getCheckedInTickets =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await ticketService.getCheckedInTickets(
          req.params.eventId,
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          tickets:
            result.tickets,

          pagination:
            result.pagination,
        },
        "Checked-in tickets fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Delete Ticket
 * ============================================================
 *
 * DELETE /api/v1/tickets/:id
 *
 * Protected:
 * Super Admin
 */

const deleteTicket = asyncHandler(
  async (req, res) => {
    const result =
      await ticketService.deleteTicket(
        req.params.id,
      );

    return ApiResponse.success(
      res,
      null,
      result.message,
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

const ticketController =
  Object.freeze({
    createTicket,

    getTicketById,
    getTicketByNumber,
    getTicketQR,

    verifyQrToken,

    getMyTickets,
    getAllTickets,

    getTicketsByEvent,
    getTicketsByFestival,

    checkInTicket,
    expireTicket,

    getCheckedInTickets,

    deleteTicket,
  });

export default ticketController;
