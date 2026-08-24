import mongoose from "mongoose";

import galleryRepository from "../repositories/gallery.repository.js";

import ApiError from "../utils/ApiError.js";

import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Pagination Helper
 * ============================================================
 */

const normalizePagination = ({
  page = 1,
  limit = 10,
} = {}) => {
  const normalizedPage = Math.max(
    1,
    Number(page) || 1,
  );

  const normalizedLimit = Math.min(
    100,
    Math.max(
      1,
      Number(limit) || 10,
    ),
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
};

/**
 * ============================================================
 * Pagination Result
 * ============================================================
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
 * Validate ObjectId
 * ============================================================
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
      `Invalid ${label}.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

/**
 * ============================================================
 * Create Gallery Item
 * ============================================================
 */

const createGalleryItem =
  async (
    galleryData,
    userId,
  ) => {
    if (!userId) {
      throw new ApiError(
        "Authenticated user is required.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const data = {
      ...galleryData,
      createdBy: userId,
      updatedBy: userId,
    };

    /**
     * At least one association is required.
     */

    if (
      !data.festival &&
      !data.event
    ) {
      throw new ApiError(
        "Gallery item must be associated with a festival or event.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (data.festival) {
      validateObjectId(
        data.festival,
        "Festival ID",
      );
    }

    if (data.event) {
      validateObjectId(
        data.event,
        "Event ID",
      );
    }

    return galleryRepository.create(
      data,
    );
  };

/**
 * ============================================================
 * Get Gallery Item By ID
 * ============================================================
 */

const getGalleryItemById =
  async (
    galleryId,
  ) => {
    validateObjectId(
      galleryId,
      "Gallery ID",
    );

    const gallery =
      await galleryRepository.findById(
        galleryId,
      );

    if (!gallery) {
      throw new ApiError(
        "Gallery item not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return gallery;
  };

/**
 * ============================================================
 * Get All Gallery Items
 * ============================================================
 *
 * Administrative listing.
 */

const getAllGalleryItems =
  async ({
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
      gallery,
      total,
    ] = await Promise.all([
      galleryRepository.findAll({
        filter,
        ...pagination,
      }),

      galleryRepository.count(
        filter,
      ),
    ]);

    return {
      gallery,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Get Published Gallery
 * ============================================================
 */

const getPublishedGallery =
  async ({
    page = 1,
    limit = 10,
  } = {}) => {
    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const [
      gallery,
      total,
    ] = await Promise.all([
      galleryRepository.getPublished(
        pagination,
      ),

      galleryRepository.countPublished(),
    ]);

    return {
      gallery,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Get Gallery By Festival
 * ============================================================
 */

const getGalleryByFestival =
  async (
    festivalId,
    {
      includeDrafts = false,
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

    const options = {
      includeDrafts,
      ...pagination,
    };

    const [
      gallery,
      total,
    ] = await Promise.all([
      galleryRepository.getByFestival(
        festivalId,
        options,
      ),

      galleryRepository.countByFestival(
        festivalId,
        {
          includeDrafts,
        },
      ),
    ]);

    return {
      gallery,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Get Gallery By Event
 * ============================================================
 */

const getGalleryByEvent =
  async (
    eventId,
    {
      includeDrafts = false,
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

    const options = {
      includeDrafts,
      ...pagination,
    };

    const [
      gallery,
      total,
    ] = await Promise.all([
      galleryRepository.getByEvent(
        eventId,
        options,
      ),

      galleryRepository.countByEvent(
        eventId,
        {
          includeDrafts,
        },
      ),
    ]);

    return {
      gallery,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Get Featured Gallery
 * ============================================================
 */

const getFeaturedGallery =
  async ({
    page = 1,
    limit = 10,
  } = {}) => {
    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const [
      gallery,
      total,
    ] = await Promise.all([
      galleryRepository.getFeatured(
        pagination,
      ),

      galleryRepository.countFeatured(),
    ]);

    return {
      gallery,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Update Gallery Item
 * ============================================================
 */

const updateGalleryItem =
  async (
    galleryId,
    updateData,
    userId,
  ) => {
    validateObjectId(
      galleryId,
      "Gallery ID",
    );

    if (!userId) {
      throw new ApiError(
        "Authenticated user is required.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    const existing =
      await galleryRepository.findByIdRaw(
        galleryId,
      );

    if (!existing) {
      throw new ApiError(
        "Gallery item not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const data = {
      ...updateData,
      updatedBy: userId,
    };

    /**
     * Determine final associations.
     */

    const finalFestival =
      data.festival !== undefined
        ? data.festival
        : existing.festival;

    const finalEvent =
      data.event !== undefined
        ? data.event
        : existing.event;

    /**
     * At least one association must remain.
     */

    if (
      !finalFestival &&
      !finalEvent
    ) {
      throw new ApiError(
        "Gallery item must be associated with a festival or event.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (finalFestival) {
      validateObjectId(
        finalFestival,
        "Festival ID",
      );
    }

    if (finalEvent) {
      validateObjectId(
        finalEvent,
        "Event ID",
      );
    }

    return galleryRepository.updateById(
      galleryId,
      data,
    );
  };

/**
 * ============================================================
 * Delete Gallery Item
 * ============================================================
 */

const deleteGalleryItem =
  async (
    galleryId,
  ) => {
    validateObjectId(
      galleryId,
      "Gallery ID",
    );

    const existing =
      await galleryRepository.findByIdRaw(
        galleryId,
      );

    if (!existing) {
      throw new ApiError(
        "Gallery item not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    await galleryRepository.deleteById(
      galleryId,
    );

    return {
      message:
        "Gallery item deleted successfully.",
    };
  };

/**
 * ============================================================
 * Find Gallery Item By Cloudinary Public ID
 * ============================================================
 */

const getGalleryItemByPublicId =
  async (
    publicId,
  ) => {
    if (
      typeof publicId !==
        "string" ||
      !publicId.trim()
    ) {
      throw new ApiError(
        "Cloudinary public ID is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const gallery =
      await galleryRepository.findByPublicId(
        publicId.trim(),
      );

    if (!gallery) {
      throw new ApiError(
        "Gallery item not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return gallery;
  };

/**
 * ============================================================
 * Service Export
 * ============================================================
 */

const galleryService =
  Object.freeze({
    createGalleryItem,

    getGalleryItemById,

    getAllGalleryItems,

    getPublishedGallery,

    getGalleryByFestival,

    getGalleryByEvent,

    getFeaturedGallery,

    updateGalleryItem,

    deleteGalleryItem,

    getGalleryItemByPublicId,
  });

export default galleryService;