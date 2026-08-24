import express from "express";

import adminController from "../controllers/admin.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";

import ROLES from "../constants/roles.js";

const router = express.Router();

/**
 * ============================================================
 * ADMIN DASHBOARD
 * ============================================================
 *
 * Administrative dashboard endpoints.
 *
 * These endpoints provide aggregated information only.
 *
 * Detailed CRUD and workflow operations are handled by their
 * respective module routes.
 *
 * ============================================================
 */

/**
 * ------------------------------------------------------------
 * Admin Dashboard
 * ------------------------------------------------------------
 *
 * GET /api/v1/admin/dashboard
 *
 * Accessible by:
 *
 * - SUPER_ADMIN
 * - FACULTY
 */

router.get(
  "/dashboard",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  adminController.getDashboard,
);

/**
 * ------------------------------------------------------------
 * Admin Overview
 * ------------------------------------------------------------
 *
 * GET /api/v1/admin/overview
 *
 * Accessible by:
 *
 * - SUPER_ADMIN
 * - FACULTY
 *
 * Returns complete administrative analytics.
 */

router.get(
  "/overview",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  adminController.getOverview,
);

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */

export default router;
