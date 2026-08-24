import express from "express";

import exportController from "../controllers/export.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

/**
 * ============================================================
 * Export Routes
 * ============================================================
 *
 * All export operations are restricted to:
 *
 * - SUPER_ADMIN
 * - FACULTY
 *
 * Exported data may contain sensitive participant/payment
 * information, so these endpoints must never be public.
 */

/**
 * ============================================================
 * Users
 * ============================================================
 *
 * GET /api/v1/export/users
 */

router.get(
  "/users",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  exportController.exportUsers,
);

/**
 * ============================================================
 * Festivals
 * ============================================================
 *
 * GET /api/v1/export/festivals
 */

router.get(
  "/festivals",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  exportController.exportFestivals,
);

/**
 * ============================================================
 * Events
 * ============================================================
 *
 * GET /api/v1/export/events
 */

router.get(
  "/events",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  exportController.exportEvents,
);

/**
 * ============================================================
 * Registrations
 * ============================================================
 *
 * GET /api/v1/export/registrations
 */

router.get(
  "/registrations",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  exportController.exportRegistrations,
);

/**
 * ============================================================
 * Payments
 * ============================================================
 *
 * GET /api/v1/export/payments
 */

router.get(
  "/payments",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  exportController.exportPayments,
);

/**
 * ============================================================
 * Accommodation
 * ============================================================
 *
 * GET /api/v1/export/accommodation
 */

router.get(
  "/accommodation",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  exportController.exportAccommodation,
);

/**
 * ============================================================
 * Tickets
 * ============================================================
 *
 * GET /api/v1/export/tickets
 */

router.get(
  "/tickets",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  exportController.exportTickets,
);

/**
 * ============================================================
 * Certificates
 * ============================================================
 *
 * GET /api/v1/export/certificates
 */

router.get(
  "/certificates",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  exportController.exportCertificates,
);

/**
 * ============================================================
 * Complete Report
 * ============================================================
 *
 * GET /api/v1/export/all
 *
 * Generates one workbook containing:
 *
 * Users
 * Festivals
 * Events
 * Registrations
 * Payments
 * Accommodation
 * Tickets
 * Certificates
 */

router.get(
  "/all",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  exportController.exportCompleteReport,
);

export default router;
