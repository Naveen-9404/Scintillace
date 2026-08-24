import Gallery from "../models/Gallery.js";

/**
 * ============================================================
 * Gallery Population Configuration
 * ============================================================
 */

const galleryPopulate = [
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
 * Create Gallery Item
 * ============================================================
 */

const create = async (
  galleryData,
  options = {},
) => {
  const [gallery] =
    await Gallery.create(
      [galleryData],
      options,
    );

  return gallery;
};

/**
 * ============================================================
 * Find Gallery Item By ID
 * ============================================================
 */

const findById = (
  galleryId,
) => {
  return Gallery.findById(
    galleryId,
  )
    .populate(galleryPopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Gallery Item By ID - Raw
 * ============================================================
 */

const findByIdRaw = (
  galleryId,
) => {
  return Gallery.findById(
    galleryId,
  )
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find All Gallery Items
 * ============================================================
 */

const findAll = ({
  filter = {},
  page = 1,
  limit = 10,
  sort = {
    displayOrder: 1,
    createdAt: -1,
  },
} = {}) => {
  return Gallery.find(filter)
    .populate(galleryPopulate)
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
 * Count Gallery Items
 * ============================================================
 */

const count = (
  filter = {},
) => {
  return Gallery.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Update Gallery Item
 * ============================================================
 */

const updateById = (
  galleryId,
  updateData,
  options = {},
) => {
  return Gallery.findByIdAndUpdate(
    galleryId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(galleryPopulate)
    .exec();
};

/**
 * ============================================================
 * Delete Gallery Item
 * ============================================================
 */

const deleteById = (
  galleryId,
  options = {},
) => {
  return Gallery.findByIdAndDelete(
    galleryId,
    options,
  ).exec();
};

/**
 * ============================================================
 * Check Whether Gallery Item Exists
 * ============================================================
 */

const galleryExists = (
  galleryId,
) => {
  return Gallery.exists({
    _id: galleryId,
  }).then(Boolean);
};

/**
 * ============================================================
 * Get Published Gallery Items
 * ============================================================
 */

const getPublished = ({
  filter = {},
  page = 1,
  limit = 10,
} = {}) => {
  return Gallery.find({
    ...filter,
    status: "PUBLISHED",
  })
    .populate(galleryPopulate)
    .sort({
      displayOrder: 1,
      createdAt: -1,
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
 * Count Published Gallery Items
 * ============================================================
 */

const countPublished = (
  filter = {},
) => {
  return Gallery.countDocuments({
    ...filter,
    status: "PUBLISHED",
  }).exec();
};

/**
 * ============================================================
 * Get Gallery By Festival
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
  const filter = {
    festival: festivalId,
  };

  if (!includeDrafts) {
    filter.status = "PUBLISHED";
  }

  return Gallery.find(filter)
    .populate(galleryPopulate)
    .sort({
      displayOrder: 1,
      createdAt: -1,
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
 * Count Gallery By Festival
 * ============================================================
 */

const countByFestival = (
  festivalId,
  {
    includeDrafts = false,
  } = {},
) => {
  const filter = {
    festival: festivalId,
  };

  if (!includeDrafts) {
    filter.status = "PUBLISHED";
  }

  return Gallery.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Get Gallery By Event
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
  const filter = {
    event: eventId,
  };

  if (!includeDrafts) {
    filter.status = "PUBLISHED";
  }

  return Gallery.find(filter)
    .populate(galleryPopulate)
    .sort({
      displayOrder: 1,
      createdAt: -1,
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
 * Count Gallery By Event
 * ============================================================
 */

const countByEvent = (
  eventId,
  {
    includeDrafts = false,
  } = {},
) => {
  const filter = {
    event: eventId,
  };

  if (!includeDrafts) {
    filter.status = "PUBLISHED";
  }

  return Gallery.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Get Featured Gallery Items
 * ============================================================
 */

const getFeatured = ({
  filter = {},
  page = 1,
  limit = 10,
} = {}) => {
  return Gallery.find({
    ...filter,
    featured: true,
    status: "PUBLISHED",
  })
    .populate(galleryPopulate)
    .sort({
      displayOrder: 1,
      createdAt: -1,
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
 * Count Featured Gallery Items
 * ============================================================
 */

const countFeatured = (
  filter = {},
) => {
  return Gallery.countDocuments({
    ...filter,
    featured: true,
    status: "PUBLISHED",
  }).exec();
};

/**
 * ============================================================
 * Get Gallery Items By Status
 * ============================================================
 */

const getByStatus = (
  status,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Gallery.find({
    status,
  })
    .populate(galleryPopulate)
    .sort({
      displayOrder: 1,
      createdAt: -1,
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
 * Find By Cloudinary Public ID
 * ============================================================
 *
 * Useful when deleting or replacing media from Cloudinary.
 * ============================================================
 */

const findByPublicId = (
  publicId,
) => {
  return Gallery.findOne({
    publicId,
  })
    .populate(galleryPopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Delete By Cloudinary Public ID
 * ============================================================
 */

const deleteByPublicId = (
  publicId,
  options = {},
) => {
  return Gallery.findOneAndDelete(
    {
      publicId,
    },
    options,
  ).exec();
};

/**
 * ============================================================
 * Repository Export
 * ============================================================
 */

const galleryRepository =
  Object.freeze({
    create,

    findById,
    findByIdRaw,

    findAll,
    count,

    updateById,
    deleteById,

    galleryExists,

    getPublished,
    countPublished,

    getByFestival,
    countByFestival,

    getByEvent,
    countByEvent,

    getFeatured,
    countFeatured,

    getByStatus,

    findByPublicId,
    deleteByPublicId,
  });

export default galleryRepository;