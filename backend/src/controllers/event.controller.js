import eventService from "../services/event.service.js";

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
 * Create Event
 * ============================================================
 *
 * POST /api/v1/events
 *
 * Protected:
 * Admin / Faculty
 */

const createEvent = asyncHandler(
  async (req, res) => {
    const event =
      await eventService.createEvent(
        req.body,
        req.user.id,
      );

    return ApiResponse.success(
      res,
      {
        event,
      },
      "Event created successfully.",
      HTTP_STATUS.CREATED,
    );
  },
);

/**
 * ============================================================
 * Get All Events
 * ============================================================
 *
 * GET /api/v1/events
 *
 * Intended for administrative/internal listing.
 */

const getAllEvents = asyncHandler(
  async (req, res) => {
    const pagination =
      getPagination(req);

    const result =
      await eventService.getAllEvents(
        pagination,
      );

    return ApiResponse.success(
      res,
      {
        events: result.events,
        pagination:
          result.pagination,
      },
      "Events fetched successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Get Event By ID
 * ============================================================
 *
 * GET /api/v1/events/:id
 */

const getEventById = asyncHandler(
  async (req, res) => {
    const event =
      await eventService.getEventById(
        req.params.id,
      );

    return ApiResponse.success(
      res,
      {
        event,
      },
      "Event fetched successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Update Event
 * ============================================================
 *
 * PUT /api/v1/events/:id
 *
 * Protected:
 * Admin / Faculty
 */

const updateEvent = asyncHandler(
  async (req, res) => {
    const event =
      await eventService.updateEvent(
        req.params.id,
        req.body,
      );

    return ApiResponse.success(
      res,
      {
        event,
      },
      "Event updated successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Delete Event
 * ============================================================
 *
 * DELETE /api/v1/events/:id
 *
 * Protected:
 * Admin
 */

const deleteEvent = asyncHandler(
  async (req, res) => {
    const result =
      await eventService.deleteEvent(
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
 * Get Events By Festival
 * ============================================================
 *
 * GET /api/v1/events/festival/:festivalId
 */

const getEventsByFestival =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await eventService.getEventsByFestival(
          req.params.festivalId,
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          events: result.events,
          pagination:
            result.pagination,
        },
        "Festival events fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Events By Category
 * ============================================================
 *
 * GET /api/v1/events/category/:category
 *
 * Category remains flexible because the final
 * Scintillace categories have not yet been finalized.
 */

const getEventsByCategory =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await eventService.getEventsByCategory(
          req.params.category,
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          events: result.events,
          pagination:
            result.pagination,
        },
        "Events fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Published Events
 * ============================================================
 *
 * GET /api/v1/events/published
 *
 * Public.
 *
 * Used by the Scintillace website.
 */

const getPublishedEvents =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await eventService.getPublishedEvents(
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          events: result.events,
          pagination:
            result.pagination,
        },
        "Published events fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Open Registration Events
 * ============================================================
 *
 * GET /api/v1/events/open-registration
 *
 * Public.
 */

const getOpenRegistrationEvents =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await eventService.getOpenRegistrationEvents(
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          events: result.events,
          pagination:
            result.pagination,
        },
        "Open registration events fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Upcoming Events
 * ============================================================
 *
 * GET /api/v1/events/upcoming
 *
 * Public.
 */

const getUpcomingEvents =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await eventService.getUpcomingEvents(
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          events: result.events,
          pagination:
            result.pagination,
        },
        "Upcoming events fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Search Events
 * ============================================================
 *
 * GET /api/v1/events/search?q=robotics
 *
 * Public.
 */

const searchEvents = asyncHandler(
  async (req, res) => {
    const searchTerm =
      req.query.q;

    const pagination =
      getPagination(req);

    const result =
      await eventService.searchEvents(
        searchTerm,
        pagination,
      );

    return ApiResponse.success(
      res,
      {
        events: result.events,
        pagination:
          result.pagination,
      },
      "Event search completed successfully.",
      HTTP_STATUS.OK,
    );
  },
);

/**
 * ============================================================
 * Get Event Availability
 * ============================================================
 *
 * GET /api/v1/events/:id/availability
 *
 * Public.
 *
 * Actual occupied/remaining seats will be connected
 * to the Registration and Team modules.
 */

const getEventAvailability =
  asyncHandler(
    async (req, res) => {
      const availability =
        await eventService.getEventAvailability(
          req.params.id,
        );

      return ApiResponse.success(
        res,
        {
          availability,
        },
        "Event availability fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

const eventController =
  Object.freeze({
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    getEventsByFestival,
    getEventsByCategory,
    getPublishedEvents,
    getOpenRegistrationEvents,
    getUpcomingEvents,
    searchEvents,
    getEventAvailability,
  });

export default eventController;
