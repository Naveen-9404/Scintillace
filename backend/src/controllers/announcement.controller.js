import announcementService from "../services/announcement.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Pagination Helper
 * ============================================================
 */

const getPagination = (
  req,
) => {
  const page =
    Number(req.query.page) || 1;

  const limit =
    Number(req.query.limit) || 10;

  return {
    page,
    limit,
  };
};

/**
 * ============================================================
 * Create Announcement
 * ============================================================
 *
 * POST /api/v1/announcements
 *
 * Protected:
 * SUPER_ADMIN / FACULTY
 * ============================================================
 */

const createAnnouncement =
  asyncHandler(
    async (req, res) => {
      const announcement =
        await announcementService.createAnnouncement(
          req.body,
          req.user.id,
        );

      return ApiResponse.success(
        res,
        {
          announcement,
        },
        "Announcement created successfully.",
        HTTP_STATUS.CREATED,
      );
    },
  );

/**
 * ============================================================
 * Get All Announcements
 * ============================================================
 *
 * GET /api/v1/announcements
 *
 * Administrative listing.
 *
 * Supported filters:
 *
 * ?status=DRAFT
 * ?status=PUBLISHED
 * ?status=ARCHIVED
 *
 * ?scope=GLOBAL
 * ?scope=FESTIVAL
 * ?scope=EVENT
 *
 * ?priority=LOW
 * ?priority=NORMAL
 * ?priority=HIGH
 * ?priority=URGENT
 *
 * Protected:
 * SUPER_ADMIN / FACULTY
 * ============================================================
 */

const getAllAnnouncements =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const filter = {};

      /**
       * --------------------------------------------------------
       * Status Filter
       * --------------------------------------------------------
       */

      if (
        req.query.status
      ) {
        filter.status =
          req.query.status;
      }

      /**
       * --------------------------------------------------------
       * Scope Filter
       * --------------------------------------------------------
       */

      if (
        req.query.scope
      ) {
        filter.scope =
          req.query.scope;
      }

      /**
       * --------------------------------------------------------
       * Priority Filter
       * --------------------------------------------------------
       */

      if (
        req.query.priority
      ) {
        filter.priority =
          req.query.priority;
      }

      const result =
        await announcementService.getAllAnnouncements(
          {
            filter,

            page:
              pagination.page,

            limit:
              pagination.limit,
          },
        );

      return ApiResponse.success(
        res,
        {
          announcements:
            result.announcements,

          pagination:
            result.pagination,
        },
        "Announcements fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Announcement By ID
 * ============================================================
 *
 * GET /api/v1/announcements/:id
 *
 * Protected:
 * SUPER_ADMIN / FACULTY
 * ============================================================
 */

const getAnnouncementById =
  asyncHandler(
    async (req, res) => {
      const announcement =
        await announcementService.getAnnouncementById(
          req.params.id,
        );

      return ApiResponse.success(
        res,
        {
          announcement,
        },
        "Announcement fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Published Announcements
 * ============================================================
 *
 * GET /api/v1/announcements/published
 *
 * PUBLIC
 *
 * Only currently visible published announcements
 * are returned by the repository.
 * ============================================================
 */

const getPublishedAnnouncements =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await announcementService.getPublishedAnnouncements(
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          announcements:
            result.announcements,

          pagination:
            result.pagination,
        },
        "Published announcements fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Announcements By Festival
 * ============================================================
 *
 * GET /api/v1/announcements/festival/:festivalId
 *
 * PUBLIC
 *
 * IMPORTANT:
 *
 * Drafts are NEVER exposed through this public endpoint.
 *
 * Even if a client sends:
 *
 * ?includeDrafts=true
 *
 * it will be ignored.
 * ============================================================
 */

const getAnnouncementsByFestival =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await announcementService.getAnnouncementsByFestival(
          req.params.festivalId,
          {
            includeDrafts: false,

            page:
              pagination.page,

            limit:
              pagination.limit,
          },
        );

      return ApiResponse.success(
        res,
        {
          announcements:
            result.announcements,

          pagination:
            result.pagination,
        },
        "Festival announcements fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Announcements By Event
 * ============================================================
 *
 * GET /api/v1/announcements/event/:eventId
 *
 * PUBLIC
 *
 * Drafts are NEVER exposed through this endpoint.
 * ============================================================
 */

const getAnnouncementsByEvent =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await announcementService.getAnnouncementsByEvent(
          req.params.eventId,
          {
            includeDrafts: false,

            page:
              pagination.page,

            limit:
              pagination.limit,
          },
        );

      return ApiResponse.success(
        res,
        {
          announcements:
            result.announcements,

          pagination:
            result.pagination,
        },
        "Event announcements fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Search Announcements
 * ============================================================
 *
 * GET /api/v1/announcements/search?q=registration
 *
 * PUBLIC
 *
 * Only currently visible published announcements
 * are searchable.
 * ============================================================
 */

const searchAnnouncements =
  asyncHandler(
    async (req, res) => {
      const searchTerm =
        req.query.q;

      const pagination =
        getPagination(req);

      const result =
        await announcementService.searchAnnouncements(
          searchTerm,
          {
            includeDrafts: false,

            page:
              pagination.page,

            limit:
              pagination.limit,
          },
        );

      return ApiResponse.success(
        res,
        {
          announcements:
            result.announcements,

          pagination:
            result.pagination,
        },
        "Announcement search completed successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Update Announcement
 * ============================================================
 *
 * PUT /api/v1/announcements/:id
 *
 * Protected:
 * SUPER_ADMIN / FACULTY
 * ============================================================
 */

const updateAnnouncement =
  asyncHandler(
    async (req, res) => {
      const announcement =
        await announcementService.updateAnnouncement(
          req.params.id,
          req.body,
          req.user.id,
        );

      return ApiResponse.success(
        res,
        {
          announcement,
        },
        "Announcement updated successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Delete Announcement
 * ============================================================
 *
 * DELETE /api/v1/announcements/:id
 *
 * Protected:
 * SUPER_ADMIN
 * ============================================================
 */

const deleteAnnouncement =
  asyncHandler(
    async (req, res) => {
      const result =
        await announcementService.deleteAnnouncement(
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
 * Publish Announcement
 * ============================================================
 *
 * PATCH /api/v1/announcements/:id/publish
 *
 * Protected:
 * SUPER_ADMIN / FACULTY
 * ============================================================
 */

const publishAnnouncement =
  asyncHandler(
    async (req, res) => {
      const announcement =
        await announcementService.publishAnnouncement(
          req.params.id,
          req.user.id,
        );

      return ApiResponse.success(
        res,
        {
          announcement,
        },
        "Announcement published successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Archive Announcement
 * ============================================================
 *
 * PATCH /api/v1/announcements/:id/archive
 *
 * Protected:
 * SUPER_ADMIN / FACULTY
 * ============================================================
 */

const archiveAnnouncement =
  asyncHandler(
    async (req, res) => {
      const announcement =
        await announcementService.archiveAnnouncement(
          req.params.id,
          req.user.id,
        );

      return ApiResponse.success(
        res,
        {
          announcement,
        },
        "Announcement archived successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Export
 * ============================================================
 */

const announcementController =
  Object.freeze({
    createAnnouncement,

    getAllAnnouncements,
    getAnnouncementById,

    getPublishedAnnouncements,

    getAnnouncementsByFestival,
    getAnnouncementsByEvent,

    searchAnnouncements,

    updateAnnouncement,
    deleteAnnouncement,

    publishAnnouncement,
    archiveAnnouncement,
  });

export default announcementController;