import Ticket from "../models/Ticket.js";

/**
 * ============================================================
 * Ticket Population Configuration
 * ============================================================
 */

const ticketPopulate = [
  {
    path: "registration",
  },

  {
    path: "user",
    select: "fullName email phone collegeId role",
  },

  {
    path: "event",
    select:
      "title description category type status startDateTime endDateTime venue",
  },

  {
    path: "festival",
    select: "title status startDate endDate",
  },

  {
    path: "checkedInBy",
    select: "fullName email role",
  },

  {
    path: "generatedBy",
    select: "fullName email role",
  },
];

/**
 * ============================================================
 * Create Ticket
 * ============================================================
 */

const create = async (ticketData, options = {}) => {
  const [ticket] = await Ticket.create([ticketData], options);

  return ticket;
};

/**
 * ============================================================
 * Find Ticket By ID
 * ============================================================
 */

const findById = (ticketId) => {
  return Ticket.findById(ticketId).populate(ticketPopulate).lean().exec();
};

/**
 * ============================================================
 * Find Ticket By ID - Raw
 * ============================================================
 */

const findByIdRaw = (ticketId) => {
  return Ticket.findById(ticketId).lean().exec();
};

/**
 * ============================================================
 * Find Ticket By Ticket Number
 * ============================================================
 */

const findByTicketNumber = (ticketNumber) => {
  return Ticket.findOne({
    ticketNumber,
  })
    .populate(ticketPopulate)
    .lean()
    .exec();
};

const findByTicketNumberWithQrToken = (ticketNumber) => {
  return Ticket.findOne({
    ticketNumber,
  })
    .select("+qrToken")
    .populate(ticketPopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Ticket By QR Token
 * ============================================================
 */

const findByQrToken = (qrToken) => {
  return Ticket.findOne({
    qrToken,
  })
    .populate(ticketPopulate)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Find Ticket By Registration
 * ============================================================
 */

const findByRegistration = (registrationId) => {
  return Ticket.findOne({
    registration: registrationId,
  })
    .populate(ticketPopulate)
    .lean()
    .exec();
};
/**
 * ============================================================
 * Find Ticket By Registration With QR Token
 * ============================================================
 */

const findByRegistrationWithQrToken =
  (registrationId) => {
    return Ticket.findOne({
      registration:
        registrationId,
    })
      .select("+qrToken")
      .populate(
        ticketPopulate,
      )
      .lean()
      .exec();
  };
/**
 * ============================================================
 * Find All Tickets
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
  return Ticket.find(filter)
    .populate(ticketPopulate)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Tickets
 * ============================================================
 */

const count = (filter = {}) => {
  return Ticket.countDocuments(filter).exec();
};

/**
 * ============================================================
 * Update Ticket
 * ============================================================
 */

const updateById = (ticketId, updateData, options = {}) => {
  return Ticket.findByIdAndUpdate(ticketId, updateData, {
    new: true,
    runValidators: true,
    ...options,
  })
    .populate(ticketPopulate)
    .exec();
};

/**
 * ============================================================
 * Delete Ticket
 * ============================================================
 */

const deleteById = (ticketId, options = {}) => {
  return Ticket.findByIdAndDelete(ticketId, options).exec();
};

/**
 * ============================================================
 * Get Tickets By User
 * ============================================================
 */

const getByUser = (userId, { page = 1, limit = 10 } = {}) => {
  return Ticket.find({
    user: userId,
  })
    .populate(ticketPopulate)
    .sort({
      createdAt: -1,
    })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Tickets By User
 * ============================================================
 */

const countByUser = (userId) => {
  return Ticket.countDocuments({
    user: userId,
  }).exec();
};

/**
 * ============================================================
 * Get Tickets By Event
 * ============================================================
 */

const getByEvent = (eventId, { page = 1, limit = 10 } = {}) => {
  return Ticket.find({
    event: eventId,
  })
    .populate(ticketPopulate)
    .sort({
      createdAt: -1,
    })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Tickets By Event
 * ============================================================
 */

const countByEvent = (eventId) => {
  return Ticket.countDocuments({
    event: eventId,
  }).exec();
};

/**
 * ============================================================
 * Get Tickets By Festival
 * ============================================================
 */

const getByFestival = (festivalId, { page = 1, limit = 10 } = {}) => {
  return Ticket.find({
    festival: festivalId,
  })
    .populate(ticketPopulate)
    .sort({
      createdAt: -1,
    })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Tickets By Festival
 * ============================================================
 */

const countByFestival = (festivalId) => {
  return Ticket.countDocuments({
    festival: festivalId,
  }).exec();
};

/**
 * ============================================================
 * Get Checked-In Tickets
 * ============================================================
 */

const getCheckedInByEvent = (eventId, { page = 1, limit = 10 } = {}) => {
  return Ticket.find({
    event: eventId,
    checkedIn: true,
  })
    .populate(ticketPopulate)
    .sort({
      checkedInAt: -1,
    })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean()
    .exec();
};

/**
 * ============================================================
 * Count Checked-In Tickets
 * ============================================================
 */

const countCheckedInByEvent = (eventId) => {
  return Ticket.countDocuments({
    event: eventId,
    checkedIn: true,
  }).exec();
};

/**
 * ============================================================
 * Ticket Exists
 * ============================================================
 */

const ticketExists = (ticketId) => {
  return Ticket.exists({
    _id: ticketId,
  }).then(Boolean);
};

/**
 * ============================================================
 * Registration Ticket Exists
 * ============================================================
 */

const registrationTicketExists = (
  registrationId,
  session = null,
) => {
  const query = Ticket.exists({
    registration: registrationId,
  });

  if (session) {
    query.session(session);
  }

  return query.then(Boolean);
};

/**
 * ============================================================
 * Ticket Repository Export
 * ============================================================
 */

const ticketRepository = Object.freeze({
  create,

  findById,
  findByIdRaw,

  findByTicketNumber,
  findByTicketNumberWithQrToken,
  findByQrToken,

  findByRegistration,
  findByRegistrationWithQrToken,

  findAll,
  count,

  updateById,
  deleteById,

  getByUser,
  countByUser,

  getByEvent,
  countByEvent,

  getByFestival,
  countByFestival,

  getCheckedInByEvent,
  countCheckedInByEvent,

  ticketExists,
  registrationTicketExists,
});

export default ticketRepository;