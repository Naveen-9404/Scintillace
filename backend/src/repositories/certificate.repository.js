import Certificate from "../models/Certificate.js";

/**
 * ============================================================
 * Certificate Population Configuration
 * ============================================================
 *
 * Keep certificate responses useful without exposing the
 * verificationCode by default.
 */

const certificatePopulate = [
  {
    path: "user",
    select: "fullName email phone collegeId",
  },

  {
    path: "registration",
    select:
      "status paymentStatus checkedIn checkedInAt event festival team",
  },

  {
    path: "event",
    select:
      "title category type status startDate endDate venue",
  },

  {
    path: "festival",
    select:
      "title status startDate endDate venue",
  },

  {
    path: "issuedBy",
    select: "fullName email role",
  },
];

/**
 * ============================================================
 * Create Certificate
 * ============================================================
 */

const create = async (
  certificateData,
  options = {},
) => {
  const [certificate] =
    await Certificate.create(
      [certificateData],
      options,
    );

  return certificate;
};

/**
 * ============================================================
 * Find Certificate By ID
 * ============================================================
 */

const findById = (
  certificateId,
) => {
  return Certificate.findById(
    certificateId,
  )
    .populate(certificatePopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Certificate By ID - Raw
 * ============================================================
 *
 * Used internally when the verificationCode or other
 * non-populated fields are required.
 */

const findByIdRaw = (
  certificateId,
) => {
  return Certificate.findById(
    certificateId,
  )
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Certificate By ID With Verification Code
 * ============================================================
 */

const findByIdWithVerificationCode = (
  certificateId,
) => {
  return Certificate.findById(
    certificateId,
  )
    .select("+verificationCode")
    .populate(certificatePopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find By Certificate Number
 * ============================================================
 */

const findByCertificateNumber = (
  certificateNumber,
) => {
  return Certificate.findOne({
    certificateNumber,
  })
    .populate(certificatePopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find By Certificate Number With Verification Code
 * ============================================================
 *
 * Used by certificate verification.
 */

const findByCertificateNumberWithVerificationCode =
  (
    certificateNumber,
  ) => {
    return Certificate.findOne({
      certificateNumber,
    })
      .select("+verificationCode")
      .populate(certificatePopulate)
      .lean()
      .exec();
  };

/**
 * ============================================================
 * Find By Verification Code
 * ============================================================
 */

const findByVerificationCode = (
  verificationCode,
) => {
  return Certificate.findOne({
    verificationCode,
  })
    .populate(certificatePopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find By Registration
 * ============================================================
 */

const findByRegistration = (
  registrationId,
) => {
  return Certificate.findOne({
    registration: registrationId,
  })
    .populate(certificatePopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find By Registration - Raw
 * ============================================================
 */

const findByRegistrationRaw = (
  registrationId,
) => {
  return Certificate.findOne({
    registration: registrationId,
  })
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find All Certificates
 * ============================================================
 */

const findAll = ({
  filter = {},
  page = 1,
  limit = 10,
  sort = {
    issuedAt: -1,
  },
} = {}) => {
  return Certificate.find(filter)
    .populate(certificatePopulate)
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
 * Count Certificates
 * ============================================================
 */

const count = (
  filter = {},
) => {
  return Certificate.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Update Certificate
 * ============================================================
 */

const updateById = (
  certificateId,
  updateData,
  options = {},
) => {
  return Certificate.findByIdAndUpdate(
    certificateId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .populate(certificatePopulate)
    .exec();
};

/**
 * ============================================================
 * Update Certificate Raw
 * ============================================================
 *
 * Useful for internal state transitions where a populated
 * response is unnecessary.
 */

const updateByIdRaw = (
  certificateId,
  updateData,
  options = {},
) => {
  return Certificate.findByIdAndUpdate(
    certificateId,
    updateData,
    {
      new: true,
      runValidators: true,
      ...options,
    },
  )
    .lean()
    .exec();
};

/**
 * ============================================================
 * Delete Certificate
 * ============================================================
 */

const deleteById = (
  certificateId,
  options = {},
) => {
  return Certificate.findByIdAndDelete(
    certificateId,
    options,
  ).exec();
};

/**
 * ============================================================
 * Get Certificates By User
 * ============================================================
 */

const getByUser = (
  userId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Certificate.find({
    user: userId,
  })
    .populate(certificatePopulate)
    .sort({
      issuedAt: -1,
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
 * Count Certificates By User
 * ============================================================
 */

const countByUser = (
  userId,
) => {
  return Certificate.countDocuments({
    user: userId,
  }).exec();
};

/**
 * ============================================================
 * Get Certificates By Event
 * ============================================================
 */

const getByEvent = (
  eventId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Certificate.find({
    event: eventId,
  })
    .populate(certificatePopulate)
    .sort({
      issuedAt: -1,
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
 * Count Certificates By Event
 * ============================================================
 */

const countByEvent = (
  eventId,
) => {
  return Certificate.countDocuments({
    event: eventId,
  }).exec();
};

/**
 * ============================================================
 * Get Certificates By Festival
 * ============================================================
 */

const getByFestival = (
  festivalId,
  {
    page = 1,
    limit = 10,
  } = {},
) => {
  return Certificate.find({
    festival: festivalId,
  })
    .populate(certificatePopulate)
    .sort({
      issuedAt: -1,
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
 * Count Certificates By Festival
 * ============================================================
 */

const countByFestival = (
  festivalId,
) => {
  return Certificate.countDocuments({
    festival: festivalId,
  }).exec();
};

/**
 * ============================================================
 * Find Certificates For Disbursal
 * ============================================================
 *
 * Returns certificates that still require email delivery.
 *
 * We intentionally use the certificate's own email delivery
 * state rather than creating duplicate certificate records.
 */

const findPendingEmailDelivery = ({
  festival,
  page = 1,
  limit = 100,
} = {}) => {
  const filter = {
    status: "ISSUED",
    emailSent: false,
  };

  if (festival) {
    filter.festival = festival;
  }

  return Certificate.find(filter)
    .populate(certificatePopulate)
    .sort({
      issuedAt: 1,
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
 * Count Pending Email Delivery
 * ============================================================
 */

const countPendingEmailDelivery = ({
  festival,
} = {}) => {
  const filter = {
    status: "ISSUED",
    emailSent: false,
  };

  if (festival) {
    filter.festival = festival;
  }

  return Certificate.countDocuments(
    filter,
  ).exec();
};

/**
 * ============================================================
 * Find Existing Certificate IDs
 * ============================================================
 *
 * Useful when processing a batch of registrations.
 *
 * This allows the disbursal service to skip registrations
 * that have already received certificates.
 */

const findExistingRegistrationIds = (
  registrationIds,
) => {
  return Certificate.find({
    registration: {
      $in: registrationIds,
    },
  })
    .select("registration")
    .lean()
    .exec();
};

/**
 * ============================================================
 * Check Certificate Exists
 * ============================================================
 */

const certificateExists = (
  certificateId,
) => {
  return Certificate.exists({
    _id: certificateId,
  }).then(Boolean);
};

/**
 * ============================================================
 * Check Registration Certificate Exists
 * ============================================================
 */

const registrationCertificateExists = (
  registrationId,
) => {
  return Certificate.exists({
    registration: registrationId,
  }).then(Boolean);
};

/**
 * ============================================================
 * Check Certificate Number Exists
 * ============================================================
 */

const certificateNumberExists = (
  certificateNumber,
) => {
  return Certificate.exists({
    certificateNumber,
  }).then(Boolean);
};

/**
 * ============================================================
 * Check Verification Code Exists
 * ============================================================
 */

const verificationCodeExists = (
  verificationCode,
) => {
  return Certificate.exists({
    verificationCode,
  }).then(Boolean);
};

/**
 * ============================================================
 * Repository Export
 * ============================================================
 */

const certificateRepository =
  Object.freeze({
    create,

    findById,
    findByIdRaw,
    findByIdWithVerificationCode,

    findByCertificateNumber,
    findByCertificateNumberWithVerificationCode,

    findByVerificationCode,

    findByRegistration,
    findByRegistrationRaw,

    findAll,
    count,

    updateById,
    updateByIdRaw,

    deleteById,

    getByUser,
    countByUser,

    getByEvent,
    countByEvent,

    getByFestival,
    countByFestival,

    findPendingEmailDelivery,
    countPendingEmailDelivery,

    findExistingRegistrationIds,

    certificateExists,
    registrationCertificateExists,

    certificateNumberExists,
    verificationCodeExists,
  });

export default certificateRepository;