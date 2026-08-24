import User from "../models/User.js";
import Festival from "../models/Festival.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import Payment from "../models/Payment.js";
import Accommodation from "../models/accommodation.model.js";
import Ticket from "../models/Ticket.js";
import Certificate from "../models/Certificate.js";

import {
  createExcelWorkbook,
  createMultiSheetWorkbook,
} from "../utils/excel.js";

/**
 * ============================================================
 * Generic Export Helper
 * ============================================================
 */

const exportModel = async (
  Model,
  {
    filter = {},
    populate = [],
    sort = {
      createdAt: -1,
    },
  } = {},
) => {
  let query = Model.find(filter);

  if (Array.isArray(populate)) {
    populate.forEach((item) => {
      query = query.populate(item);
    });
  }

  const records =
    await query
      .sort(sort)
      .lean()
      .exec();

  return records;
};

/**
 * ============================================================
 * Export Users
 * ============================================================
 */

const exportUsers = async ({
  filter = {},
} = {}) => {
  const records =
    await exportModel(User, {
      filter,
      sort: {
        createdAt: -1,
      },
    });

  return createExcelWorkbook(
    records,
    {
      sheetName: "Users",
    },
  );
};

/**
 * ============================================================
 * Export Festivals
 * ============================================================
 */

const exportFestivals = async ({
  filter = {},
} = {}) => {
  const records =
    await exportModel(Festival, {
      filter,
      sort: {
        createdAt: -1,
      },
    });

  return createExcelWorkbook(
    records,
    {
      sheetName: "Festivals",
    },
  );
};

/**
 * ============================================================
 * Export Events
 * ============================================================
 */

const exportEvents = async ({
  filter = {},
} = {}) => {
  const records =
    await exportModel(Event, {
      filter,

      populate: [
        {
          path: "festival",
          select: "title status",
        },

        {
          path: "createdBy",
          select:
            "fullName email role",
        },
      ],

      sort: {
        createdAt: -1,
      },
    });

  return createExcelWorkbook(
    records,
    {
      sheetName: "Events",
    },
  );
};

/**
 * ============================================================
 * Export Registrations
 * ============================================================
 */

const exportRegistrations = async ({
  filter = {},
} = {}) => {
  const records =
    await exportModel(
      Registration,
      {
        filter,

        populate: [
          {
            path: "user",
            select:
              "fullName email phone role",
          },

          {
            path: "event",
            select:
              "title category type",
          },

          {
            path: "festival",
            select: "title status",
          },

          {
            path: "team",
            select:
              "name status",
          },
        ],

        sort: {
          registrationDate: -1,
        },
      },
    );

  return createExcelWorkbook(
    records,
    {
      sheetName: "Registrations",
    },
  );
};

/**
 * ============================================================
 * Export Payments
 * ============================================================
 */

const exportPayments = async ({
  filter = {},
} = {}) => {
  const records =
    await exportModel(
      Payment,
      {
        filter,

        populate: [
          {
            path: "user",
            select:
              "fullName email phone",
          },

          {
            path: "registration",
            select:
              "status paymentStatus",
          },

          {
            path: "accommodation",
          },
        ],

        sort: {
          createdAt: -1,
        },
      },
    );

  return createExcelWorkbook(
    records,
    {
      sheetName: "Payments",
    },
  );
};

/**
 * ============================================================
 * Export Accommodation
 * ============================================================
 */

const exportAccommodation =
  async ({
    filter = {},
  } = {}) => {
    const records =
      await exportModel(
        Accommodation,
        {
          filter,

          populate: [
            {
              path: "user",
              select:
                "fullName email phone",
            },

            {
              path: "festival",
              select: "title status",
            },
          ],

          sort: {
            createdAt: -1,
          },
        },
      );

    return createExcelWorkbook(
      records,
      {
        sheetName:
          "Accommodation",
      },
    );
  };

/**
 * ============================================================
 * Export Tickets
 * ============================================================
 */

const exportTickets = async ({
  filter = {},
} = {}) => {
  const records =
    await exportModel(Ticket, {
      filter,

      populate: [
        {
          path: "user",
          select:
            "fullName email phone",
        },

        {
          path: "event",
          select:
            "title category type",
        },

        {
          path: "festival",
          select: "title status",
        },

        {
          path: "registration",
          select:
            "status paymentStatus checkedIn checkedInAt",
        },
      ],

      sort: {
        createdAt: -1,
      },
    });

  return createExcelWorkbook(
    records,
    {
      sheetName: "Tickets",
    },
  );
};

/**
 * ============================================================
 * Export Certificates
 * ============================================================
 */

const exportCertificates =
  async ({
    filter = {},
  } = {}) => {
    const records =
      await exportModel(
        Certificate,
        {
          filter,

          populate: [
            {
              path: "user",
              select:
                "fullName email phone",
            },

            {
              path: "event",
              select:
                "title category type",
            },

            {
              path: "festival",
              select: "title status",
            },

            {
              path: "registration",
              select:
                "status checkedIn",
            },
          ],

          sort: {
            createdAt: -1,
          },
        },
      );

    return createExcelWorkbook(
      records,
      {
        sheetName:
          "Certificates",
      },
    );
  };

/**
 * ============================================================
 * Export Complete Report
 * ============================================================
 */

const exportCompleteReport =
  async () => {
    const [
      users,
      festivals,
      events,
      registrations,
      payments,
      accommodation,
      tickets,
      certificates,
    ] = await Promise.all([
      User.find()
        .lean()
        .exec(),

      Festival.find()
        .lean()
        .exec(),

      Event.find()
        .lean()
        .exec(),

      Registration.find()
        .lean()
        .exec(),

      Payment.find()
        .lean()
        .exec(),

      Accommodation.find()
        .lean()
        .exec(),

      Ticket.find()
        .lean()
        .exec(),

      Certificate.find()
        .lean()
        .exec(),
    ]);

    return createMultiSheetWorkbook([
      {
        name: "Users",
        data: users,
      },

      {
        name: "Festivals",
        data: festivals,
      },

      {
        name: "Events",
        data: events,
      },

      {
        name: "Registrations",
        data: registrations,
      },

      {
        name: "Payments",
        data: payments,
      },

      {
        name: "Accommodation",
        data: accommodation,
      },

      {
        name: "Tickets",
        data: tickets,
      },

      {
        name: "Certificates",
        data: certificates,
      },
    ]);
  };

/**
 * ============================================================
 * Export
 * ============================================================
 */

const exportService =
  Object.freeze({
    exportUsers,

    exportFestivals,

    exportEvents,

    exportRegistrations,

    exportPayments,

    exportAccommodation,

    exportTickets,

    exportCertificates,

    exportCompleteReport,
  });

export default exportService;