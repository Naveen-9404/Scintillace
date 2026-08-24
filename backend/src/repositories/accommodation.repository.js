import Accommodation from "../models/accommodation.model.js";

import {
  ACCOMMODATION_BOOKING_STATUS,
  ACCOMMODATION_PAYMENT_STATUS,
} from "../constants/accommodation.constants.js";

/**
 * ============================================================
 * Populate Configuration
 * ============================================================
 */

const accommodationPopulate = [
  {
    path: "user",
    select:
      "fullName email collegeId role",
  },

  {
    path: "registration",
    populate: [
      {
        path: "event",
        select:
          "title category type venue startDateTime endDateTime",
      },
    ],
  },

  {
    path: "event",
    select:
      "title category type venue startDateTime endDateTime festival",
    populate: {
      path: "festival",
      select:
        "title status",
    },
  },

  {
    path: "payment",
    select:
      "amount currency gateway orderId paymentId status paidAt",
  },
];

/**
 * ============================================================
 * Pagination Helper
 * ============================================================
 */

const getPagination = ({
  page = 1,
  limit = 10,
} = {}) => ({
  skip:
    (page - 1) * limit,

  limit,
});

/**
 * ============================================================
 * Create Accommodation
 * ============================================================
 */

const create = async (
  accommodationData,
  session = null,
) => {
  const [accommodation] =
    await Accommodation.create(
      [accommodationData],
      session
        ? { session }
        : {},
    );

  return accommodation.populate(
    accommodationPopulate,
  );
};

/**
 * ============================================================
 * Find Accommodation By ID
 * ============================================================
 */

const findById = (
  accommodationId,
) => {
  return Accommodation.findById(
    accommodationId,
  )
    .populate(
      accommodationPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Find Accommodation Document By ID
 * ============================================================
 *
 * Returns a real Mongoose document.
 */

const findDocumentById = (
  accommodationId,
) => {
  return Accommodation.findById(
    accommodationId,
  ).exec();
};

/**
 * ============================================================
 * Find Accommodation By User
 * ============================================================
 */

const findByUser = (
  userId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  const {
    skip,
    limit: paginationLimit,
  } = getPagination({
    page,
    limit,
  });

  return Accommodation.find({
    user: userId,
  })
    .populate(
      accommodationPopulate,
    )
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(
      paginationLimit,
    )
    .exec();
};

/**
 * ============================================================
 * Find Accommodation By Registration
 * ============================================================
 *
 * One accommodation booking per registration.
 */

const findByRegistration = (
  registrationId,
) => {
  return Accommodation.findOne({
    registration:
      registrationId,
  })
    .populate(
      accommodationPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Find Accommodation By Event
 * ============================================================
 */

const findByEvent = (
  eventId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  const {
    skip,
    limit: paginationLimit,
  } = getPagination({
    page,
    limit,
  });

  return Accommodation.find({
    event: eventId,
  })
    .populate(
      accommodationPopulate,
    )
    .sort({
      createdAt: -1,
    })
    .skip(skip)
    .limit(
      paginationLimit,
    )
    .exec();
};

/**
 * ============================================================
 * Find All Accommodations
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
  const {
    skip,
    limit: paginationLimit,
  } = getPagination({
    page,
    limit,
  });

  return Accommodation.find(
    filter,
  )
    .populate(
      accommodationPopulate,
    )
    .sort(sort)
    .skip(skip)
    .limit(
      paginationLimit,
    )
    .exec();
};

/**
 * ============================================================
 * Count Accommodations
 * ============================================================
 */

const count = (
  filter = {},
) => {
  return Accommodation.countDocuments(
    filter,
  );
};

/**
 * ============================================================
 * Count Confirmed Bookings
 * ============================================================
 *
 * Used for accommodation dashboard/reporting.
 *
 * No room capacity is calculated here because actual hostel
 * and room allocation is handled offline.
 */

const countConfirmedBookings = (
  eventId,
  hostelType = null,
) => {
  const filter = {
    event: eventId,

    bookingStatus:
      ACCOMMODATION_BOOKING_STATUS.CONFIRMED,
  };

  if (hostelType) {
    filter.hostelType =
      hostelType;
  }

  return Accommodation.countDocuments(
    filter,
  );
};

/**
 * ============================================================
 * Count Confirmed Bookings By Hostel
 * ============================================================
 *
 * Useful for admin reporting.
 *
 * Returns:
 *
 * {
 *   BOYS: number,
 *   GIRLS: number
 * }
 */

const countConfirmedByHostel = async (
  eventId,
) => {
  const result =
    await Accommodation.aggregate([
      {
        $match: {
          event: eventId,

          bookingStatus:
            ACCOMMODATION_BOOKING_STATUS.CONFIRMED,
        },
      },

      {
        $group: {
          _id: "$hostelType",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

  return result;
};

/**
 * ============================================================
 * Find Pending Accommodation
 * ============================================================
 */

const findPendingByUser = (
  userId,
) => {
  return Accommodation.findOne({
    user: userId,

    bookingStatus:
      ACCOMMODATION_BOOKING_STATUS.PENDING,
  })
    .populate(
      accommodationPopulate,
    )
    .sort({
      createdAt: -1,
    })
    .exec();
};

/**
 * ============================================================
 * Find Paid Accommodation
 * ============================================================
 */

const findPaidByUser = (
  userId,
) => {
  return Accommodation.findOne({
    user: userId,

    paymentStatus:
      ACCOMMODATION_PAYMENT_STATUS.PAID,
  })
    .populate(
      accommodationPopulate,
    )
    .sort({
      createdAt: -1,
    })
    .exec();
};

/**
 * ============================================================
 * Find By Confirmation Code
 * ============================================================
 */

const findByConfirmationCode = (
  confirmationCode,
) => {
  return Accommodation.findOne({
    confirmationCode:
      confirmationCode
        .trim()
        .toUpperCase(),
  })
    .populate(
      accommodationPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Update Accommodation
 * ============================================================
 */

const updateById = (
  accommodationId,
  updateData,
  session = null,
) => {
  return Accommodation.findByIdAndUpdate(
    accommodationId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...(session
        ? { session }
        : {}),
    },
  )
    .populate(
      accommodationPopulate,
    )
    .exec();
};

/**
 * ============================================================
 * Delete Accommodation
 * ============================================================
 */

const deleteById = (
  accommodationId,
) => {
  return Accommodation.findByIdAndDelete(
    accommodationId,
  ).exec();
};

/**
 * ============================================================
 * Repository Export
 * ============================================================
 */

const accommodationRepository =
  Object.freeze({
    create,

    findById,

    findDocumentById,

    findByUser,

    findByRegistration,

    findByEvent,

    findAll,

    count,

    countConfirmedBookings,

    countConfirmedByHostel,

    findPendingByUser,

    findPaidByUser,

    findByConfirmationCode,

    updateById,

    deleteById,
  });

export default accommodationRepository;