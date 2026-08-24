import exportService from "../services/export.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Export Users
 * ============================================================
 *
 * GET /api/v1/export/users
 */

const exportUsers = asyncHandler(
  async (req, res) => {
    const buffer =
      await exportService.exportUsers({
        filter: req.query.filter || {},
      });

    res.status(
      HTTP_STATUS.OK,
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="scintillace-users-${Date.now()}.xlsx"`,
    );

    return res.send(buffer);
  },
);

/**
 * ============================================================
 * Export Festivals
 * ============================================================
 *
 * GET /api/v1/export/festivals
 */

const exportFestivals =
  asyncHandler(
    async (req, res) => {
      const buffer =
        await exportService.exportFestivals(
          {
            filter:
              req.query.filter || {},
          },
        );

      res.status(
        HTTP_STATUS.OK,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="scintillace-festivals-${Date.now()}.xlsx"`,
      );

      return res.send(buffer);
    },
  );

/**
 * ============================================================
 * Export Events
 * ============================================================
 *
 * GET /api/v1/export/events
 */

const exportEvents =
  asyncHandler(
    async (req, res) => {
      const buffer =
        await exportService.exportEvents(
          {
            filter:
              req.query.filter || {},
          },
        );

      res.status(
        HTTP_STATUS.OK,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="scintillace-events-${Date.now()}.xlsx"`,
      );

      return res.send(buffer);
    },
  );

/**
 * ============================================================
 * Export Registrations
 * ============================================================
 *
 * GET /api/v1/export/registrations
 */

const exportRegistrations =
  asyncHandler(
    async (req, res) => {
      const buffer =
        await exportService.exportRegistrations(
          {
            filter:
              req.query.filter || {},
          },
        );

      res.status(
        HTTP_STATUS.OK,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="scintillace-registrations-${Date.now()}.xlsx"`,
      );

      return res.send(buffer);
    },
  );

/**
 * ============================================================
 * Export Payments
 * ============================================================
 *
 * GET /api/v1/export/payments
 */

const exportPayments =
  asyncHandler(
    async (req, res) => {
      const buffer =
        await exportService.exportPayments(
          {
            filter:
              req.query.filter || {},
          },
        );

      res.status(
        HTTP_STATUS.OK,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="scintillace-payments-${Date.now()}.xlsx"`,
      );

      return res.send(buffer);
    },
  );

/**
 * ============================================================
 * Export Accommodation
 * ============================================================
 *
 * GET /api/v1/export/accommodation
 */

const exportAccommodation =
  asyncHandler(
    async (req, res) => {
      const buffer =
        await exportService.exportAccommodation(
          {
            filter:
              req.query.filter || {},
          },
        );

      res.status(
        HTTP_STATUS.OK,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="scintillace-accommodation-${Date.now()}.xlsx"`,
      );

      return res.send(buffer);
    },
  );

/**
 * ============================================================
 * Export Tickets
 * ============================================================
 *
 * GET /api/v1/export/tickets
 */

const exportTickets =
  asyncHandler(
    async (req, res) => {
      const buffer =
        await exportService.exportTickets(
          {
            filter:
              req.query.filter || {},
          },
        );

      res.status(
        HTTP_STATUS.OK,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="scintillace-tickets-${Date.now()}.xlsx"`,
      );

      return res.send(buffer);
    },
  );

/**
 * ============================================================
 * Export Certificates
 * ============================================================
 *
 * GET /api/v1/export/certificates
 */

const exportCertificates =
  asyncHandler(
    async (req, res) => {
      const buffer =
        await exportService.exportCertificates(
          {
            filter:
              req.query.filter || {},
          },
        );

      res.status(
        HTTP_STATUS.OK,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="scintillace-certificates-${Date.now()}.xlsx"`,
      );

      return res.send(buffer);
    },
  );

/**
 * ============================================================
 * Export Complete Report
 * ============================================================
 *
 * GET /api/v1/export/all
 *
 * Produces one workbook containing multiple sheets.
 */

const exportCompleteReport =
  asyncHandler(
    async (req, res) => {
      const buffer =
        await exportService.exportCompleteReport();

      res.status(
        HTTP_STATUS.OK,
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="scintillace-complete-report-${Date.now()}.xlsx"`,
      );

      return res.send(buffer);
    },
  );

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

const exportController =
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

export default exportController;
