import crypto from "crypto";
import mongoose from "mongoose";

import ticketRepository from "../repositories/ticket.repository.js";
import Volunteer from "../models/Volunteer.js";

import qrService from "./qr.service.js";

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
const validateObjectId = (
  value,
  label,
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      value,
    )
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Invalid ${label}.`,
    );
  }
};

/**
 * Normalize pagination.
 */
const normalizePagination = ({
  page = 1,
  limit = 10,
} = {}) => ({
  page: Math.max(
    1,
    Number(page) || 1,
  ),

  limit: Math.min(
    100,
    Math.max(
      1,
      Number(limit) || 10,
    ),
  ),
});

/**
 * Build pagination response.
 */
const buildPagination = ({
  page,
  limit,
  total,
}) => ({
  page,
  limit,
  total,

  totalPages:
    total === 0
      ? 0
      : Math.ceil(
          total / limit,
        ),
});

/**
 * ============================================================
 * Generate Ticket Number
 * ============================================================
 */

const generateTicketNumber =
  () => {
    const timestamp =
      Date.now()
        .toString(36)
        .toUpperCase();

    const random =
      crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `FS-TKT-${timestamp}-${random}`;
  };

/**
 * ============================================================
 * Generate QR Token
 * ============================================================
 */

const generateQrToken =
  () => {
    return qrService.generateTicketToken();
  };

/**
 * ============================================================
 * Ticket Authorization Helper
 * ============================================================
 *
 * Ticket QR access is allowed for:
 *
 * - Ticket owner
 * - Super Admin
 * - Faculty
 *
 * Volunteers do not need access to another user's QR code.
 * They only need to verify and check in tickets through the
 * scanner workflow.
 * ============================================================
 */

const isTicketOwnerOrAdmin = (
  ticket,
  requesterId,
  requesterRole,
) => {
  const ticketUserId =
    ticket.user?._id ||
    ticket.user;

  return (
    ticketUserId?.toString() ===
      requesterId.toString() ||
    requesterRole ===
      ROLES.SUPER_ADMIN ||
    requesterRole ===
      ROLES.FACULTY
  );
};

/**
 * ============================================================
 * Create Ticket
 * ============================================================
 *
 * Normally called after a successful registration/payment
 * workflow.
 */

const createTicket = async (
  ticketData,
  generatedBy = null,
  session = null,
) => {
  const {
    registration,
    user,
    event,
    festival,
  } = ticketData;

  validateObjectId(
    registration,
    "Registration ID",
  );

  validateObjectId(
    user,
    "User ID",
  );

  validateObjectId(
    event,
    "Event ID",
  );

  validateObjectId(
    festival,
    "Festival ID",
  );

  /**
   * Prevent duplicate ticket generation for the
   * same registration.
   */

  const existing =
    await ticketRepository.registrationTicketExists(
      registration,
      session,
    );

  if (existing) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "A ticket has already been generated for this registration.",
    );
  }

  const ticketNumber =
    generateTicketNumber();

  const qrToken =
    generateQrToken();

  return ticketRepository.create(
    {
      ...ticketData,

      ticketNumber,

      qrToken,

      generatedBy,

      generatedAt:
        ticketData.generatedAt ||
        new Date(),

      status:
        ticketData.status ||
        "ACTIVE",
    },

    session
      ? { session }
      : {},
  );
};

/**
 * ============================================================
 * Get Ticket By ID
 * ============================================================
 */

const getTicketById = async (
  ticketId,
) => {
  validateObjectId(
    ticketId,
    "Ticket ID",
  );

  const ticket =
    await ticketRepository.findById(
      ticketId,
    );

  if (!ticket) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Ticket not found.",
    );
  }

  return ticket;
};

/**
 * ============================================================
 * Get Ticket By Ticket Number
 * ============================================================
 */

const getTicketByNumber =
  async (
    ticketNumber,
  ) => {
    if (
      typeof ticketNumber !==
        "string" ||
      !ticketNumber.trim()
    ) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Ticket number is required.",
      );
    }

    const ticket =
      await ticketRepository.findByTicketNumber(
        ticketNumber
          .trim()
          .toUpperCase(),
      );

    if (!ticket) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Ticket not found.",
      );
    }

    return ticket;
  };

/**
 * ============================================================
 * Get Ticket QR
 * ============================================================
 */

const getTicketQR = async (
  ticketId,
  requesterId,
  requesterRole,
) => {
  const ticket =
    await getTicketById(
      ticketId,
    );

  if (
    !isTicketOwnerOrAdmin(
      ticket,
      requesterId,
      requesterRole,
    )
  ) {
    throw new ApiError(
      "You are not authorized to access this ticket QR code.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const ticketWithQrToken =
    await ticketRepository.findByTicketNumberWithQrToken(
      ticket.ticketNumber,
    );

  if (!ticketWithQrToken) {
    throw new ApiError(
      "Ticket not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  const { qrCode } =
    await qrService.generateTicketQR(
      ticketWithQrToken,
    );

  return {
    ticketNumber:
      ticketWithQrToken.ticketNumber,

    qrCode,
  };
};

/**
 * ============================================================
 * Verify QR Token
 * ============================================================
 *
 * Verifies the complete Scintillace ticket QR payload.
 *
 * Verification does NOT perform check-in.
 *
 * Check-in remains a separate operation.
 */

const verifyQrToken = async (
  qrPayload,
) => {
  if (
    qrPayload === undefined ||
    qrPayload === null ||
    qrPayload === ""
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "QR payload is required.",
    );
  }

  return qrService.verifyTicketQR(
    qrPayload,
  );
};

/**
 * ============================================================
 * Get My Tickets
 * ============================================================
 */

const getMyTickets = async (
  userId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  validateObjectId(
    userId,
    "User ID",
  );

  const pagination =
    normalizePagination({
      page,
      limit,
    });

  const [
    tickets,
    total,
  ] = await Promise.all([
    ticketRepository.getByUser(
      userId,
      pagination,
    ),

    ticketRepository.countByUser(
      userId,
    ),
  ]);

  return {
    tickets,

    pagination:
      buildPagination({
        ...pagination,
        total,
      }),
  };
};

/**
 * ============================================================
 * Get All Tickets
 * ============================================================
 */

const getAllTickets = async ({
  filter = {},
  page = 1,
  limit = 10,
} = {}) => {
  const pagination =
    normalizePagination({
      page,
      limit,
    });

  const [
    tickets,
    total,
  ] = await Promise.all([
    ticketRepository.findAll({
      filter,
      ...pagination,
    }),

    ticketRepository.count(
      filter,
    ),
  ]);

  return {
    tickets,

    pagination:
      buildPagination({
        ...pagination,
        total,
      }),
  };
};

/**
 * ============================================================
 * Get Tickets By Event
 * ============================================================
 */

const getTicketsByEvent =
  async (
    eventId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    validateObjectId(
      eventId,
      "Event ID",
    );

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const [
      tickets,
      total,
    ] = await Promise.all([
      ticketRepository.getByEvent(
        eventId,
        pagination,
      ),

      ticketRepository.countByEvent(
        eventId,
      ),
    ]);

    return {
      tickets,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Get Tickets By Festival
 * ============================================================
 */

const getTicketsByFestival =
  async (
    festivalId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    validateObjectId(
      festivalId,
      "Festival ID",
    );

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const [
      tickets,
      total,
    ] = await Promise.all([
      ticketRepository.getByFestival(
        festivalId,
        pagination,
      ),

      ticketRepository.countByFestival(
        festivalId,
      ),
    ]);

    return {
      tickets,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Check In Ticket
 * ============================================================
 *
 * This is the actual event-entry operation.
 *
 * QR verification and check-in remain separate so the
 * scanning interface can first validate the ticket and then
 * explicitly perform the check-in.
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
 *     the volunteer has an ACTIVE assignment.
 */

const checkInTicket = async (
  ticketId,
  checkedInBy,
  checkedInByRole,
) => {
  /**
   * ==========================================================
   * Validate Ticket ID
   * ==========================================================
   */

  validateObjectId(
    ticketId,
    "Ticket ID",
  );

  /**
   * ==========================================================
   * Validate User ID
   * ==========================================================
   */

  validateObjectId(
    checkedInBy,
    "User ID",
  );

  /**
   * ==========================================================
   * Find Ticket
   * ==========================================================
   */

  const existing =
    await ticketRepository.findByIdRaw(
      ticketId,
    );

  if (!existing) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Ticket not found.",
    );
  }

  /**
   * ==========================================================
   * Validate Event Association
   * ==========================================================
   */

  if (!existing.event) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "This ticket is not associated with an event.",
    );
  }

  /**
   * ==========================================================
   * Volunteer Event Authorization
   * ==========================================================
   *
   * Super Admin:
   *   unrestricted
   *
   * Faculty:
   *   unrestricted
   *
   * Volunteer:
   *   must have an ACTIVE Volunteer assignment
   *   for this specific event.
   */

  if (
    checkedInByRole ===
    ROLES.VOLUNTEER
  ) {
    const assignment =
      await Volunteer.findOne({
        user: checkedInBy,
        event: existing.event,
        status: "ACTIVE",
      }).lean();

    if (!assignment) {
      throw new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You are not assigned to this event and cannot check in this ticket.",
      );
    }
  }



  /**
   * ==========================================================
   * Expired Ticket
   * ==========================================================
   */

  if (
    existing.status ===
    "EXPIRED"
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Expired tickets cannot be checked in.",
    );
  }

  /**
   * ==========================================================
   * Expiration Date Check
   * ==========================================================
   */

  if (
    existing.expiresAt &&
    new Date(
      existing.expiresAt,
    ) <= new Date()
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "This ticket has expired.",
    );
  }

  /**
   * ==========================================================
   * Already Checked In
   * ==========================================================
   */

  if (
    existing.checkedIn
  ) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "This ticket has already been checked in.",
    );
  }

  /**
   * ==========================================================
   * Perform Check-In
   * ==========================================================
   */

  return ticketRepository.updateById(
    ticketId,
    {
      checkedIn: true,

      checkedInAt:
        new Date(),

      checkedInBy,

      status: "USED",
    },
  );
};

/**
 * ============================================================
 * Expire Ticket
 * ============================================================
 */

const expireTicket = async (
  ticketId,
) => {
  validateObjectId(
    ticketId,
    "Ticket ID",
  );

  const existing =
    await ticketRepository.findByIdRaw(
      ticketId,
    );

  if (!existing) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Ticket not found.",
    );
  }

  if (
    existing.status !==
    "ACTIVE"
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Only active tickets can be expired.",
    );
  }

  return ticketRepository.updateById(
    ticketId,
    {
      status: "EXPIRED",
    },
  );
};

/**
 * ============================================================
 * Get Event Check-In List
 * ============================================================
 */

const getCheckedInTickets =
  async (
    eventId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    validateObjectId(
      eventId,
      "Event ID",
    );

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const [
      tickets,
      total,
    ] = await Promise.all([
      ticketRepository.getCheckedInByEvent(
        eventId,
        pagination,
      ),

      ticketRepository.countCheckedInByEvent(
        eventId,
      ),
    ]);

    return {
      tickets,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Delete Ticket
 * ============================================================
 */

const deleteTicket = async (
  ticketId,
) => {
  validateObjectId(
    ticketId,
    "Ticket ID",
  );

  const existing =
    await ticketRepository.findByIdRaw(
      ticketId,
    );

  if (!existing) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Ticket not found.",
    );
  }

  await ticketRepository.deleteById(
    ticketId,
  );

  return {
    message:
      "Ticket deleted successfully.",
  };
};

/**
 * ============================================================
 * Service Export
 * ============================================================
 */

const ticketService =
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

export default ticketService;
