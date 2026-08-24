import express from "express";

import analyticsController from "../controllers/analytics.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

/**
 * ============================================================
 * Analytics Access
 * ============================================================
 *
 * Analytics are administrative information.
 *
 * Super Admin and Faculty can access analytics.
 * Students should not have access to system-wide analytics.
 * ============================================================
 */

/**
 * ------------------------------------------------------------
 * Complete Analytics
 * ------------------------------------------------------------
 *
 * GET /api/v1/analytics
 */

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  analyticsController.getCompleteAnalytics,
);

/**
 * ------------------------------------------------------------
 * Dashboard Analytics
 * ------------------------------------------------------------
 *
 * GET /api/v1/analytics/dashboard
 */

router.get(
  "/dashboard",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  analyticsController.getDashboardAnalytics,
);

/**
 * ------------------------------------------------------------
 * User Analytics
 * ------------------------------------------------------------
 *
 * GET /api/v1/analytics/users
 */

router.get(
  "/users",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  analyticsController.getUserAnalytics,
);

/**
 * ------------------------------------------------------------
 * Festival Analytics
 * ------------------------------------------------------------
 *
 * GET /api/v1/analytics/festivals
 */

router.get(
  "/festivals",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  analyticsController.getFestivalAnalytics,
);

/**
 * ------------------------------------------------------------
 * Event Analytics
 * ------------------------------------------------------------
 *
 * GET /api/v1/analytics/events
 */

router.get(
  "/events",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  analyticsController.getEventAnalytics,
);

/**
 * ------------------------------------------------------------
 * Registration Analytics
 * ------------------------------------------------------------
 *
 * GET /api/v1/analytics/registrations
 */

router.get(
  "/registrations",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  analyticsController.getRegistrationAnalytics,
);

/**
 * ------------------------------------------------------------
 * Payment Analytics
 * ------------------------------------------------------------
 *
 * GET /api/v1/analytics/payments
 */

router.get(
  "/payments",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  analyticsController.getPaymentAnalytics,
);

/**
 * ------------------------------------------------------------
 * Ticket Analytics
 * ------------------------------------------------------------
 *
 * GET /api/v1/analytics/tickets
 */

router.get(
  "/tickets",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  analyticsController.getTicketAnalytics,
);

/**
 * ------------------------------------------------------------
 * Accommodation Analytics
 * ------------------------------------------------------------
 *
 * GET /api/v1/analytics/accommodation
 */

router.get(
  "/accommodation",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  analyticsController.getAccommodationAnalytics,
);

export default router;