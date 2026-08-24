import mongoose from "mongoose";

import announcementRepository from "../repositories/announcement.repository.js";

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
      HTTP_STATUS.BAD_REQUEST,
      `Invalid ${label}.`,
    );
  }
};

/**
 * ============================================================
 * Create Announcement
 * ============================================================
 */

const createAnnouncement = async (
  announcementData,
  userId,
) => {
  const data = {
    ...announcementData,
    createdBy: userId,
    updatedBy: userId,
  };

  /**
   * Festival-specific announcement.
   */

  if (
    data.scope === "FESTIVAL"
  ) {
    validateObjectId(
      data.festival,
      "Festival ID",
    );
  }

  /**
   * Event-specific announcement.
   */

  if (
    data.scope === "EVENT"
  ) {
    validateObjectId(
      data.event,
      "Event ID",
    );
  }

  /**
   * Global announcement should not
   * reference another resource.
   */

  if (
    data.scope === "GLOBAL"
  ) {
    data.festival = null;
    data.event = null;
  }

  return announcementRepository.create(
    data,
  );
};

/**
 * ============================================================
 * Get Announcement By ID
 * ============================================================
 */

const getAnnouncementById =
  async (
    announcementId,
  ) => {
    validateObjectId(
      announcementId,
      "Announcement ID",
    );

    const announcement =
      await announcementRepository.findById(
        announcementId,
      );

    if (!announcement) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Announcement not found.",
      );
    }

    return announcement;
  };

/**
 * ============================================================
 * Get All Announcements
 * ============================================================
 *
 * Administrative listing.
 *
 * Drafts and archived announcements may be returned here.
 * ============================================================
 */

const getAllAnnouncements =
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
      announcements,
      total,
    ] = await Promise.all([
      announcementRepository.findAll({
        filter,
        ...pagination,
      }),

      announcementRepository.count(
        filter,
      ),
    ]);

    return {
      announcements,
      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Get Published Announcements
 * ============================================================
 */

const getPublishedAnnouncements =
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
      announcements,
      total,
    ] = await Promise.all([
      announcementRepository.getPublished(
        pagination,
      ),

      announcementRepository.countPublished(),
    ]);

    return {
      announcements,
      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Get Announcements By Festival
 * ============================================================
 */

const getAnnouncementsByFestival =
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
      announcements,
      total,
    ] = await Promise.all([
      announcementRepository.getByFestival(
        festivalId,
        options,
      ),

      announcementRepository.countByFestival(
        festivalId,
        {
          includeDrafts,
        },
      ),
    ]);

    return {
      announcements,
      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Get Announcements By Event
 * ============================================================
 */

const getAnnouncementsByEvent =
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
      announcements,
      total,
    ] = await Promise.all([
      announcementRepository.getByEvent(
        eventId,
        options,
      ),

      announcementRepository.countByEvent(
        eventId,
        {
          includeDrafts,
        },
      ),
    ]);

    return {
      announcements,
      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Search Announcements
 * ============================================================
 */

const searchAnnouncements =
  async (
    searchTerm,
    {
      includeDrafts = false,
      page = 1,
      limit = 10,
    } = {},
  ) => {
    if (
      typeof searchTerm !==
        "string" ||
      !searchTerm.trim()
    ) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "Search term is required.",
      );
    }

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
      announcements,
      total,
    ] = await Promise.all([
      announcementRepository.search(
        searchTerm.trim(),
        options,
      ),

      announcementRepository.countSearch(
        searchTerm.trim(),
        {
          includeDrafts,
        },
      ),
    ]);

    return {
      announcements,
      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Update Announcement
 * ============================================================
 */

const updateAnnouncement =
  async (
    announcementId,
    updateData,
    userId,
  ) => {
    validateObjectId(
      announcementId,
      "Announcement ID",
    );

    const existing =
      await announcementRepository.findByIdRaw(
        announcementId,
      );

    if (!existing) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Announcement not found.",
      );
    }

    const data = {
      ...updateData,
      updatedBy: userId,
    };

    /**
     * Determine final scope because scope may or may not
     * be included in the update request.
     */

    const finalScope =
      data.scope ??
      existing.scope;

    /**
     * If changing to FESTIVAL, a festival must exist.
     */

    if (
      finalScope === "FESTIVAL"
    ) {
      const festivalId =
        data.festival ??
        existing.festival;

      validateObjectId(
        festivalId,
        "Festival ID",
      );

      data.festival =
        festivalId;

      data.event = null;
    }

    /**
     * If changing to EVENT, an event must exist.
     */

    if (
      finalScope === "EVENT"
    ) {
      const eventId =
        data.event ??
        existing.event;

      validateObjectId(
        eventId,
        "Event ID",
      );

      data.event = eventId;

      data.festival = null;
    }

    /**
     * If changing to GLOBAL, clear references.
     */

    if (
      finalScope === "GLOBAL"
    ) {
      data.festival = null;
      data.event = null;
    }

    return announcementRepository.updateById(
      announcementId,
      data,
    );
  };

/**
 * ============================================================
 * Delete Announcement
 * ============================================================
 */

const deleteAnnouncement =
  async (
    announcementId,
  ) => {
    validateObjectId(
      announcementId,
      "Announcement ID",
    );

    const existing =
      await announcementRepository.findByIdRaw(
        announcementId,
      );

    if (!existing) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Announcement not found.",
      );
    }

    await announcementRepository.deleteById(
      announcementId,
    );

    return {
      message:
        "Announcement deleted successfully.",
    };
  };

/**
 * ============================================================
 * Publish Announcement
 * ============================================================
 */

const publishAnnouncement =
  async (
    announcementId,
    userId,
  ) => {
    validateObjectId(
      announcementId,
      "Announcement ID",
    );

    const existing =
      await announcementRepository.findByIdRaw(
        announcementId,
      );

    if (!existing) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Announcement not found.",
      );
    }

    const announcement =
      await announcementRepository.publishById(
        announcementId,
        userId,
      );

    return announcement;
  };

/**
 * ============================================================
 * Archive Announcement
 * ============================================================
 */

const archiveAnnouncement =
  async (
    announcementId,
    userId,
  ) => {
    validateObjectId(
      announcementId,
      "Announcement ID",
    );

    const existing =
      await announcementRepository.findByIdRaw(
        announcementId,
      );

    if (!existing) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Announcement not found.",
      );
    }

    const announcement =
      await announcementRepository.archiveById(
        announcementId,
        userId,
      );

    return announcement;
  };

/**
 * ============================================================
 * Service Export
 * ============================================================
 */

const announcementService =
  Object.freeze({
    createAnnouncement,

    getAnnouncementById,
    getAllAnnouncements,
    getPublishedAnnouncements,

    getAnnouncementsByFestival,
    getAnnouncementsByEvent,

    searchAnnouncements,

    updateAnnouncement,
    deleteAnnouncement,

    publishAnnouncement,
    archiveAnnouncement,
  });

export default announcementService;