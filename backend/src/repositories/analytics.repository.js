import { User } from "../models/index.js";

import Event from "../models/Event.js";
import Festival from "../models/Festival.js";
import Registration from "../models/Registration.js";
import Ticket from "../models/Ticket.js";
import Payment from "../models/Payment.js";
import Accommodation from "../models/accommodation.model.js";

/**
 * ============================================================
 * Dashboard Statistics
 * ============================================================
 */

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalFestivals,
    totalEvents,
    totalRegistrations,
    totalTickets,
    totalPayments,
    totalAccommodationBookings,
  ] = await Promise.all([
    User.countDocuments(),

    Festival.countDocuments(),

    Event.countDocuments(),

    Registration.countDocuments(),

    Ticket.countDocuments(),

    Payment.countDocuments(),

    Accommodation.countDocuments(),
  ]);

  return {
    totalUsers,
    totalFestivals,
    totalEvents,
    totalRegistrations,
    totalTickets,
    totalPayments,
    totalAccommodationBookings,
  };
};

/**
 * ============================================================
 * User Statistics
 * ============================================================
 */

const getUserStats = async () => {
  const result =
    await User.aggregate([
      {
        $group: {
          _id: "$role",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

  return result.map(
    (item) => ({
      role: item._id,
      count: item.count,
    }),
  );
};

/**
 * ============================================================
 * Festival Statistics
 * ============================================================
 */

const getFestivalStats =
  async () => {
    const result =
      await Festival.aggregate([
        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]);

    return result.map(
      (item) => ({
        status: item._id,
        count: item.count,
      }),
    );
  };

/**
 * ============================================================
 * Event Statistics
 * ============================================================
 */

const getEventStats = async () => {
  const [
    byCategory,
    byType,
    byStatus,
  ] = await Promise.all([
    Event.aggregate([
      {
        $group: {
          _id: "$category",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]),

    Event.aggregate([
      {
        $group: {
          _id: "$type",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]),

    Event.aggregate([
      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]),
  ]);

  return {
    byCategory: byCategory.map(
      (item) => ({
        category: item._id,
        count: item.count,
      }),
    ),

    byType: byType.map(
      (item) => ({
        type: item._id,
        count: item.count,
      }),
    ),

    byStatus: byStatus.map(
      (item) => ({
        status: item._id,
        count: item.count,
      }),
    ),
  };
};

/**
 * ============================================================
 * Registration Statistics
 * ============================================================
 */

const getRegistrationStats =
  async () => {
    const [
      byStatus,
      byEvent,
      byFestival,
    ] = await Promise.all([
      Registration.aggregate([
        {
          $group: {
            _id: "$status",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Registration.aggregate([
        {
          $group: {
            _id: "$event",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },

        {
          $limit: 20,
        },

        {
          $lookup: {
            from: "events",

            localField: "_id",

            foreignField: "_id",

            as: "event",
          },
        },

        {
          $unwind: {
            path: "$event",

            preserveNullAndEmptyArrays:
              true,
          },
        },

        {
          $project: {
            _id: 0,

            eventId: "$_id",

            eventTitle:
              "$event.title",

            count: 1,
          },
        },
      ]),

      Registration.aggregate([
        {
          $group: {
            _id: "$festival",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },

        {
          $limit: 20,
        },

        {
          $lookup: {
            from: "festivals",

            localField: "_id",

            foreignField: "_id",

            as: "festival",
          },
        },

        {
          $unwind: {
            path: "$festival",

            preserveNullAndEmptyArrays:
              true,
          },
        },

        {
          $project: {
            _id: 0,

            festivalId: "$_id",

            festivalTitle:
              "$festival.title",

            count: 1,
          },
        },
      ]),
    ]);

  return {
    byStatus: byStatus.map(
      (item) => ({
        status: item._id,
        count: item.count,
      }),
    ),

    byEvent,

    byFestival,
  };
};

/**
 * ============================================================
 * Payment Statistics
 * ============================================================
 */

const getPaymentStats = async () => {
  const [
    byStatus,
    byGateway,
    byPurpose,
    revenue,
  ] = await Promise.all([
    /**
     * Payments by status
     */

    Payment.aggregate([
      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]),

    /**
     * Payments by gateway
     */

    Payment.aggregate([
      {
        $group: {
          _id: "$gateway",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]),

    /**
     * Payments by purpose
     */

    Payment.aggregate([
      {
        $group: {
          _id: "$paymentFor",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]),

    /**
     * Successful revenue
     *
     * Only PAID payments count as completed
     * revenue in the current Payment model.
     */

    Payment.aggregate([
      {
        $match: {
          status: "PAID",
        },
      },

      {
        $group: {
          _id: null,

          totalRevenue: {
            $sum: "$amount",
          },

          transactionCount: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  return {
    byStatus: byStatus.map(
      (item) => ({
        status: item._id,
        count: item.count,
      }),
    ),

    byGateway: byGateway.map(
      (item) => ({
        gateway: item._id,
        count: item.count,
      }),
    ),

    byPurpose: byPurpose.map(
      (item) => ({
        paymentFor: item._id,
        count: item.count,
      }),
    ),

    revenue:
      revenue[0] || {
        totalRevenue: 0,
        transactionCount: 0,
      },
  };
};

/**
 * ============================================================
 * Ticket Statistics
 * ============================================================
 */

const getTicketStats = async () => {
  const [
    byStatus,
    checkInStats,
  ] = await Promise.all([
    Ticket.aggregate([
      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]),

    Ticket.aggregate([
      {
        $group: {
          _id: null,

          totalTickets: {
            $sum: 1,
          },

          checkedIn: {
            $sum: {
              $cond: [
                "$checkedIn",
                1,
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const checkIn =
    checkInStats[0] || {
      totalTickets: 0,
      checkedIn: 0,
    };

  return {
    byStatus: byStatus.map(
      (item) => ({
        status: item._id,
        count: item.count,
      }),
    ),

    totalTickets:
      checkIn.totalTickets,

    checkedIn:
      checkIn.checkedIn,

    notCheckedIn:
      checkIn.totalTickets -
      checkIn.checkedIn,

    checkInRate:
      checkIn.totalTickets > 0
        ? Number(
            (
              (checkIn.checkedIn /
                checkIn.totalTickets) *
              100
            ).toFixed(2),
          )
        : 0,
  };
};

/**
 * ============================================================
 * Accommodation Statistics
 * ============================================================
 *
 * Accommodation uses hostel selection only.
 *
 * Available selections:
 *
 * - Boys Hostel
 * - Girls Hostel
 *
 * Physical room / bed allocation is handled offline.
 *
 * Therefore analytics track hostel type instead of room type.
 */

const getAccommodationStats =
  async () => {
    const [
      byBookingStatus,
      byPaymentStatus,
      byHostelType,
    ] = await Promise.all([
      /**
       * --------------------------------------------------------
       * Booking Status
       * --------------------------------------------------------
       */

      Accommodation.aggregate([
        {
          $group: {
            _id: "$bookingStatus",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),

      /**
       * --------------------------------------------------------
       * Payment Status
       * --------------------------------------------------------
       */

      Accommodation.aggregate([
        {
          $group: {
            _id: "$paymentStatus",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),

      /**
       * --------------------------------------------------------
       * Hostel Type
       * --------------------------------------------------------
       *
       * No room / bed allocation is performed by
       * FestSphere.
       */

      Accommodation.aggregate([
        {
          $group: {
            _id: "$hostelType",

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),
    ]);

  return {
    byBookingStatus:
      byBookingStatus.map(
        (item) => ({
          status: item._id,
          count: item.count,
        }),
      ),

    byPaymentStatus:
      byPaymentStatus.map(
        (item) => ({
          status: item._id,
          count: item.count,
        }),
      ),

    byHostelType:
      byHostelType.map(
        (item) => ({
          hostelType: item._id,
          count: item.count,
        }),
      ),
  };
};

/**
 * ============================================================
 * Complete Analytics
 * ============================================================
 */

const getCompleteAnalytics =
  async () => {
    const [
      dashboard,
      users,
      festivals,
      events,
      registrations,
      payments,
      tickets,
      accommodation,
    ] = await Promise.all([
      getDashboardStats(),

      getUserStats(),

      getFestivalStats(),

      getEventStats(),

      getRegistrationStats(),

      getPaymentStats(),

      getTicketStats(),

      getAccommodationStats(),
    ]);

    return {
      dashboard,

      users,

      festivals,

      events,

      registrations,

      payments,

      tickets,

      accommodation,
    };
  };

/**
 * ============================================================
 * Repository Export
 * ============================================================
 */

const analyticsRepository =
  Object.freeze({
    getDashboardStats,

    getUserStats,

    getFestivalStats,

    getEventStats,

    getRegistrationStats,

    getPaymentStats,

    getTicketStats,

    getAccommodationStats,

    getCompleteAnalytics,
  });

export default analyticsRepository;