import Payment from "../models/Payment.js";

/**
 * ============================================================
 * Payment Population Configuration
 * ============================================================
 */

const paymentPopulate = [
  {
    path: "user",
    select:
      "fullName email phone collegeId role",
  },

  {
    path: "registration",

    populate: [
      {
        path: "user",

        select:
          "fullName email phone collegeId role",
      },

      {
        path: "event",

        select:
          "title description category type status startDateTime endDateTime venue registrationFee currency isPaid",
      },

      {
        path: "festival",

        select:
          "title status startDate endDate",
      },

      {
        path: "team",

        select:
          "name code status maxMembers",
      },
    ],
  },

  {
    path: "accommodation",
  },
];

/**
 * ============================================================
 * Basic Payment Queries
 * ============================================================
 */

/**
 * Find payment by ID.
 */

const findById = (
  paymentId,
) => {
  return Payment.findById(
    paymentId,
  )
    .populate(paymentPopulate)
    .exec();
};

/**
 * Find payment by order ID.
 */

const findByOrderId = (
  orderId,
) => {
  return Payment.findOne({
    orderId,
  })
    .populate(paymentPopulate)
    .exec();
};

/**
 * Find payment by payment ID.
 */

const findByPaymentId = (
  paymentId,
) => {
  return Payment.findOne({
    paymentId,
  })
    .populate(paymentPopulate)
    .exec();
};

/**
 * ============================================================
 * Pending Payment Queries
 * ============================================================
 */

/**
 * Find pending event payment by registration.
 */

const findPendingByRegistration =
  (
    registrationId,
  ) => {
    return Payment.findOne({
      registration:
        registrationId,

      paymentFor:
        "EVENT",

      status:
        "PENDING",
    })
      .populate(paymentPopulate)
      .sort({
        createdAt: -1,
      })
      .exec();
  };

/**
 * Find pending accommodation payment.
 */

const findPendingByAccommodation =
  (
    accommodationId,
  ) => {
    return Payment.findOne({
      accommodation:
        accommodationId,

      paymentFor:
        "ACCOMMODATION",

      status:
        "PENDING",
    })
      .populate(paymentPopulate)
      .sort({
        createdAt: -1,
      })
      .exec();
  };

/**
 * ============================================================
 * Create Payment
 * ============================================================
 */

const create = async (
  paymentData,
  options = {},
) => {
  const [
    payment,
  ] = await Payment.create(
    [paymentData],
    options,
  );

  return payment;
};

/**
 * ============================================================
 * Update Payment By ID
 * ============================================================
 */

const updateById = (
  paymentId,
  updateData,
  options = {},
) => {
  return Payment.findByIdAndUpdate(
    paymentId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(paymentPopulate)
    .exec();
};

/**
 * ============================================================
 * Update Payment By Order ID
 * ============================================================
 */

const updateByOrderId = (
  orderId,
  updateData,
  options = {},
) => {
  return Payment.findOneAndUpdate(
    {
      orderId,
    },
    updateData,
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(paymentPopulate)
    .exec();
};

/**
 * ============================================================
 * Delete Payment
 * ============================================================
 */

const deleteById = (
  paymentId,
  options = {},
) => {
  return Payment.findByIdAndDelete(
    paymentId,
    options,
  ).exec();
};

/**
 * ============================================================
 * Find Payments By User
 * ============================================================
 */

const findByUser = (
  userId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Payment.find({
    user: userId,
  })
    .populate(paymentPopulate)
    .sort({
      createdAt: -1,
    })
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .exec();
};

/**
 * ============================================================
 * Find All Payments
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
  return Payment.find(filter)
    .populate(paymentPopulate)
    .sort(sort)
    .skip(
      (page - 1) * limit,
    )
    .limit(limit)
    .exec();
};

/**
 * ============================================================
 * Count Payments
 * ============================================================
 */

const count = (
  filter = {},
) => {
  return Payment.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Payment Exists
 * ============================================================
 */

const exists = (
  filter = {},
) => {
  return Payment.exists(
    filter,
  ).then(Boolean);
};

/**
 * ============================================================
 * Find Payment By Registration
 * ============================================================
 */

const findByRegistration = (
  registrationId,
) => {
  return Payment.findOne({
    registration:
      registrationId,
  })
    .populate(paymentPopulate)
    .sort({
      createdAt: -1,
    })
    .exec();
};

/**
 * ============================================================
 * Find Payment By Accommodation
 * ============================================================
 */

const findByAccommodation = (
  accommodationId,
) => {
  return Payment.findOne({
    accommodation:
      accommodationId,
  })
    .populate(paymentPopulate)
    .sort({
      createdAt: -1,
    })
    .exec();
};

/**
 * ============================================================
 * Confirmation Email Helpers
 * ============================================================
 *
 * These fields correspond to Payment.js:
 *
 * confirmationEmailStatus
 * confirmationEmailSentAt
 * confirmationEmailMessageId
 * confirmationEmailError
 * confirmationEmailAttempts
 * confirmationEmailLastAttemptAt
 * confirmationEmailLastFailedAt
 *
 * The claim operation is atomic.
 *
 * This prevents duplicate confirmation emails when:
 *
 * 1. Admin manual approval runs
 * 2. Background retry job runs
 *
 * at nearly the same time.
 */

/**
 * ============================================================
 * Claim Confirmation Email
 * ============================================================
 *
 * IMPORTANT:
 *
 * Both NOT_SENT and FAILED are claimable.
 *
 * This allows failed confirmation emails to be retried.
 */

const claimConfirmationEmail =
  async (
    paymentId,
  ) => {
    return Payment.findOneAndUpdate(
      {
        _id:
          paymentId,

        status:
          "PAID",

        confirmationEmailStatus: {
          $in: [
            "NOT_SENT",
            "FAILED",
          ],
        },
      },

      {
        $set: {
          confirmationEmailStatus:
            "SENDING",

          confirmationEmailLastAttemptAt:
            new Date(),
        },

        $inc: {
          confirmationEmailAttempts: 1,
        },
      },

      {
        new: true,
      },
    )
      .populate(paymentPopulate)
      .exec();
  };

/**
 * ============================================================
 * Mark Confirmation Email Sent
 * ============================================================
 */

const markConfirmationEmailSent =
  async (
    paymentId,
    {
      messageId = null,
    } = {},
  ) => {
    return Payment.findByIdAndUpdate(
      paymentId,

      {
        $set: {
          confirmationEmailStatus:
            "SENT",

          confirmationEmailSentAt:
            new Date(),

          confirmationEmailMessageId:
            messageId,

          confirmationEmailError:
            "",
        },
      },

      {
        new: true,
      },
    ).exec();
  };

/**
 * ============================================================
 * Mark Confirmation Email Failed
 * ============================================================
 */

const markConfirmationEmailFailed =
  async (
    paymentId,
    errorMessage = "",
  ) => {
    return Payment.findByIdAndUpdate(
      paymentId,

      {
        $set: {
          confirmationEmailStatus:
            "FAILED",

          confirmationEmailError:
            String(
              errorMessage || "",
            ).slice(0, 1000),

          confirmationEmailLastFailedAt:
            new Date(),
        },
      },

      {
        new: true,
      },
    ).exec();
  };

/**
 * ============================================================
 * Find Payments Requiring Confirmation Email
 * ============================================================
 *
 * Useful for retrying failed email delivery.
 *
 * Includes:
 *
 * - EVENT
 * - ACCOMMODATION
 *
 * And:
 *
 * - NOT_SENT
 * - FAILED
 *
 * Excludes:
 *
 * - SENDING
 * - SENT
 */

const findPaymentsPendingConfirmationEmail =
  async ({
    limit = 50,
  } = {}) => {
    return Payment.find({
      paymentFor: {
        $in: [
          "EVENT",
          "ACCOMMODATION",
        ],
      },

      status:
        "PAID",

      confirmationEmailStatus: {
        $in: [
          "NOT_SENT",
          "FAILED",
        ],
      },
    })
      .sort({
        paidAt: 1,
      })
      .limit(limit)
      .populate(paymentPopulate)
      .exec();
  };

/**
 * ============================================================
 * Payment Repository Export
 * ============================================================
 */

const paymentRepository =
  Object.freeze({
    create,

    findById,
    findByOrderId,
    findByPaymentId,

    findPendingByRegistration,
    findPendingByAccommodation,

    findByRegistration,
    findByAccommodation,

    findByUser,
    findAll,
    count,
    exists,

    updateById,
    updateByOrderId,

    deleteById,

    claimConfirmationEmail,
    markConfirmationEmailSent,
    markConfirmationEmailFailed,

    findPaymentsPendingConfirmationEmail,
  });

export default paymentRepository;