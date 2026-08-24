import Announcement from "../models/Announcement.js";

/**
 * ============================================================
 * Announcement Population Configuration
 * ============================================================
 */

const announcementPopulate = [
  {
    path: "festival",
    select: "title status",
  },

  {
    path: "event",
    select: "title status festival",
  },

  {
    path: "createdBy",
    select: "fullName email role",
  },

  {
    path: "updatedBy",
    select: "fullName email role",
  },
];

/**
 * ============================================================
 * Published Visibility Filter
 * ============================================================
 *
 * Used only for PUBLIC announcement queries.
 *
 * An announcement is publicly visible when:
 *
 * 1. status is PUBLISHED
 *
 * 2. visibleFrom is either:
 *    - null
 *    - less than or equal to now
 *
 * 3. visibleUntil is either:
 *    - null
 *    - greater than or equal to now
 *
 * This prevents scheduled announcements from appearing early
 * and prevents expired announcements from remaining visible.
 * ============================================================
 */

const getPublishedVisibilityFilter = () => {
  const now = new Date();

  return {
    status: "PUBLISHED",

    $and: [
      {
        $or: [
          {
            visibleFrom: null,
          },
          {
            visibleFrom: {
              $lte: now,
            },
          },
        ],
      },

      {
        $or: [
          {
            visibleUntil: null,
          },
          {
            visibleUntil: {
              $gte: now,
            },
          },
        ],
      },
    ],
  };
};

/**
 * ============================================================
 * Create Announcement
 * ============================================================
 */

const create = async (
  announcementData,
  options = {},
) => {
  const [announcement] =
    await Announcement.create(
      [announcementData],
      options,
    );

  return announcement;
};

/**
 * ============================================================
 * Find Announcement By ID
 * ============================================================
 */

const findById = (
  announcementId,
) => {
  return Announcement.findById(
    announcementId,
  )
    .populate(
      announcementPopulate,
    )
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Announcement By ID - Raw
 * ============================================================
 *
 * Returns the announcement without population.
 *
 * Used internally by the service layer for business logic.
 * ============================================================
 */

const findByIdRaw = (
  announcementId,
) => {
  return Announcement.findById(
    announcementId,
  )
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find All Announcements
 * ============================================================
 *
 * Administrative query.
 *
 * This intentionally does NOT apply the public visibility
 * filter because administrators must be able to see:
 *
 * - DRAFT
 * - PUBLISHED
 * - ARCHIVED
 *
 * announcements.
 * ============================================================
 */

const findAll = ({
  filter = {},
  page = 1,
  limit = 10,
  sort = {
    createdAt: -1,
  },
} = {}) => {
  return Announcement.find(
    filter,
  )
    .populate(
      announcementPopulate,
    )
    .sort(sort)
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Announcements
 * ============================================================
 *
 * Administrative count.
 * ============================================================
 */

const count = (
  filter = {},
) => {
  return Announcement.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Update Announcement By ID
 * ============================================================
 */

const updateById = (
  announcementId,
  updateData,
  options = {},
) => {
  return Announcement.findByIdAndUpdate(
    announcementId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(
      announcementPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Delete Announcement By ID
 * ============================================================
 */

const deleteById = (
  announcementId,
  options = {},
) => {
  return Announcement.findByIdAndDelete(
    announcementId,
    options,
  ).exec();
};

/**
 * ============================================================
 * Check Whether Announcement Exists
 * ============================================================
 */

const announcementExists = (
  announcementId,
) => {
  return Announcement.exists({
    _id: announcementId,
  }).then(Boolean);
};

/**
 * ============================================================
 * Get Published Announcements
 * ============================================================
 *
 * PUBLIC
 *
 * Only currently visible published announcements are returned.
 * ============================================================
 */

const getPublished = ({
  filter = {},
  page = 1,
  limit = 10,
} = {}) => {
  return Announcement.find({
    ...filter,
    ...getPublishedVisibilityFilter(),
  })
    .populate(
      announcementPopulate,
    )
    .sort({
      publishedAt: -1,
    })
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Published Announcements
 * ============================================================
 *
 * Must use exactly the same visibility rules as getPublished()
 * so pagination totals remain accurate.
 * ============================================================
 */

const countPublished = (
  filter = {},
) => {
  return Announcement.countDocuments({
    ...filter,
    ...getPublishedVisibilityFilter(),
  }).exec();
};

/**
 * ============================================================
 * Get Announcements By Festival
 * ============================================================
 *
 * Public requests should use:
 *
 * includeDrafts = false
 *
 * The controller will always force public requests to false.
 *
 * The option remains here because the service/repository design
 * may still be useful internally.
 * ============================================================
 */

const getByFestival = (
  festivalId,
  {
    includeDrafts = false,
    page = 1,
    limit = 10,
  } = {},
) => {
  const baseFilter = {
    festival: festivalId,
  };

  const filter = includeDrafts
    ? baseFilter
    : {
        ...baseFilter,
        ...getPublishedVisibilityFilter(),
      };

  return Announcement.find(
    filter,
  )
    .populate(
      announcementPopulate,
    )
    .sort({
      publishedAt: -1,
    })
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Announcements By Festival
 * ============================================================
 */

const countByFestival = (
  festivalId,
  {
    includeDrafts = false,
  } = {},
) => {
  const baseFilter = {
    festival: festivalId,
  };

  const filter = includeDrafts
    ? baseFilter
    : {
        ...baseFilter,
        ...getPublishedVisibilityFilter(),
      };

  return Announcement.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Get Announcements By Event
 * ============================================================
 */

const getByEvent = (
  eventId,
  {
    includeDrafts = false,
    page = 1,
    limit = 10,
  } = {},
) => {
  const baseFilter = {
    event: eventId,
  };

  const filter = includeDrafts
    ? baseFilter
    : {
        ...baseFilter,
        ...getPublishedVisibilityFilter(),
      };

  return Announcement.find(
    filter,
  )
    .populate(
      announcementPopulate,
    )
    .sort({
      publishedAt: -1,
    })
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Announcements By Event
 * ============================================================
 */

const countByEvent = (
  eventId,
  {
    includeDrafts = false,
  } = {},
) => {
  const baseFilter = {
    event: eventId,
  };

  const filter = includeDrafts
    ? baseFilter
    : {
        ...baseFilter,
        ...getPublishedVisibilityFilter(),
      };

  return Announcement.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Get Announcements By Scope
 * ============================================================
 */

const getByScope = (
  scope,
  {
    includeDrafts = false,
    page = 1,
    limit = 10,
  } = {},
) => {
  const baseFilter = {
    scope,
  };

  const filter = includeDrafts
    ? baseFilter
    : {
        ...baseFilter,
        ...getPublishedVisibilityFilter(),
      };

  return Announcement.find(
    filter,
  )
    .populate(
      announcementPopulate,
    )
    .sort({
      publishedAt: -1,
    })
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Search Announcements
 * ============================================================
 *
 * Public search only searches currently visible published
 * announcements.
 *
 * This prevents:
 *
 * - Draft announcements
 * - Future announcements
 * - Expired announcements
 *
 * from appearing in public search.
 * ============================================================
 */

const search = (
  searchTerm,
  {
    includeDrafts = false,
    page = 1,
    limit = 10,
  } = {},
) => {
  const textFilter = {
    $text: {
      $search: searchTerm,
    },
  };

  const filter = includeDrafts
    ? textFilter
    : {
        ...textFilter,
        ...getPublishedVisibilityFilter(),
      };

  return Announcement.find(
    filter,
  )
    .populate(
      announcementPopulate,
    )
    .sort({
      score: {
        $meta: "textScore",
      },

      publishedAt: -1,
    })
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Search Results
 * ============================================================
 */

const countSearch = (
  searchTerm,
  {
    includeDrafts = false,
  } = {},
) => {
  const textFilter = {
    $text: {
      $search: searchTerm,
    },
  };

  const filter = includeDrafts
    ? textFilter
    : {
        ...textFilter,
        ...getPublishedVisibilityFilter(),
      };

  return Announcement.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Archive Announcement
 * ============================================================
 */

const archiveById = (
  announcementId,
  updatedBy,
  options = {},
) => {
  return Announcement.findByIdAndUpdate(
    announcementId,
    {
      $set: {
        status: "ARCHIVED",
        updatedBy,
      },
    },
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(
      announcementPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Publish Announcement
 * ============================================================
 */

const publishById = (
  announcementId,
  updatedBy,
  options = {},
) => {
  return Announcement.findByIdAndUpdate(
    announcementId,
    {
      $set: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        updatedBy,
      },
    },
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(
      announcementPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Repository Export
 * ============================================================
 */

const announcementRepository =
  Object.freeze({
    create,

    findById,
    findByIdRaw,

    findAll,
    count,

    updateById,
    deleteById,

    announcementExists,

    getPublished,
    countPublished,

    getByFestival,
    countByFestival,

    getByEvent,
    countByEvent,

    getByScope,

    search,
    countSearch,

    archiveById,
    publishById,
  });

export default announcementRepository;