import galleryService from "../services/gallery.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Pagination Helper
 * ============================================================
 */

const getPagination = (req) => {
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
 * Create Gallery Item
 * ============================================================
 *
 * POST /api/v1/gallery
 *
 * Protected:
 * Super Admin / Faculty
 */

const createGalleryItem =
  asyncHandler(
    async (req, res) => {
      const gallery =
        await galleryService.createGalleryItem(
          req.body,
          req.user.id,
        );

      return ApiResponse.success(
        res,
        {
          gallery,
        },
        "Gallery item created successfully.",
        HTTP_STATUS.CREATED,
      );
    },
  );

/**
 * ============================================================
 * Get All Gallery Items
 * ============================================================
 *
 * GET /api/v1/gallery
 *
 * Administrative listing.
 */

const getAllGalleryItems =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await galleryService.getAllGalleryItems(
          {
            page:
              pagination.page,
            limit:
              pagination.limit,
          },
        );

      return ApiResponse.success(
        res,
        {
          gallery:
            result.gallery,

          pagination:
            result.pagination,
        },
        "Gallery items fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Gallery Item By ID
 * ============================================================
 *
 * GET /api/v1/gallery/:id
 */

const getGalleryItemById =
  asyncHandler(
    async (req, res) => {
      const gallery =
        await galleryService.getGalleryItemById(
          req.params.id,
        );

      return ApiResponse.success(
        res,
        {
          gallery,
        },
        "Gallery item fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Published Gallery
 * ============================================================
 *
 * GET /api/v1/gallery/published
 *
 * Public.
 */

const getPublishedGallery =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await galleryService.getPublishedGallery(
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          gallery:
            result.gallery,

          pagination:
            result.pagination,
        },
        "Published gallery fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Gallery By Festival
 * ============================================================
 *
 * GET /api/v1/gallery/festival/:festivalId
 */

const getGalleryByFestival =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const includeDrafts =
        req.query.includeDrafts ===
        "true";

      const result =
        await galleryService.getGalleryByFestival(
          req.params.festivalId,
          {
            includeDrafts,
            page:
              pagination.page,
            limit:
              pagination.limit,
          },
        );

      return ApiResponse.success(
        res,
        {
          gallery:
            result.gallery,

          pagination:
            result.pagination,
        },
        "Festival gallery fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Gallery By Event
 * ============================================================
 *
 * GET /api/v1/gallery/event/:eventId
 */

const getGalleryByEvent =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const includeDrafts =
        req.query.includeDrafts ===
        "true";

      const result =
        await galleryService.getGalleryByEvent(
          req.params.eventId,
          {
            includeDrafts,
            page:
              pagination.page,
            limit:
              pagination.limit,
          },
        );

      return ApiResponse.success(
        res,
        {
          gallery:
            result.gallery,

          pagination:
            result.pagination,
        },
        "Event gallery fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Featured Gallery
 * ============================================================
 *
 * GET /api/v1/gallery/featured
 *
 * Public.
 */

const getFeaturedGallery =
  asyncHandler(
    async (req, res) => {
      const pagination =
        getPagination(req);

      const result =
        await galleryService.getFeaturedGallery(
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          gallery:
            result.gallery,

          pagination:
            result.pagination,
        },
        "Featured gallery fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Update Gallery Item
 * ============================================================
 *
 * PUT /api/v1/gallery/:id
 *
 * Protected:
 * Super Admin / Faculty
 */

const updateGalleryItem =
  asyncHandler(
    async (req, res) => {
      const gallery =
        await galleryService.updateGalleryItem(
          req.params.id,
          req.body,
          req.user.id,
        );

      return ApiResponse.success(
        res,
        {
          gallery,
        },
        "Gallery item updated successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Delete Gallery Item
 * ============================================================
 *
 * DELETE /api/v1/gallery/:id
 *
 * Protected:
 * Super Admin
 */

const deleteGalleryItem =
  asyncHandler(
    async (req, res) => {
      const result =
        await galleryService.deleteGalleryItem(
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
 * Get Gallery Item By Cloudinary Public ID
 * ============================================================
 *
 * This is intended primarily for administrative/media
 * management operations.
 *
 * GET /api/v1/gallery/cloudinary/:publicId
 */

const getGalleryItemByPublicId =
  asyncHandler(
    async (req, res) => {
      const gallery =
        await galleryService.getGalleryItemByPublicId(
          req.params.publicId,
        );

      return ApiResponse.success(
        res,
        {
          gallery,
        },
        "Gallery item fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

const galleryController =
  Object.freeze({
    createGalleryItem,

    getAllGalleryItems,
    getGalleryItemById,

    getPublishedGallery,

    getGalleryByFestival,
    getGalleryByEvent,

    getFeaturedGallery,

    updateGalleryItem,
    deleteGalleryItem,

    getGalleryItemByPublicId,
  });

export default galleryController;