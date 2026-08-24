import analyticsService from "../services/analytics.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Admin Dashboard
 * ============================================================
 *
 * GET /api/v1/admin/dashboard
 *
 * Returns the administrative dashboard analytics.
 *
 * Detailed operations such as:
 *
 * - Events
 * - Registrations
 * - Payments
 * - Tickets
 * - Accommodation
 * - Certificates
 * - Volunteers
 * - Gallery
 *
 * remain inside their respective modules.
 */

const getDashboard =
  asyncHandler(
    async (req, res) => {
      const analytics =
        await analyticsService.getDashboardAnalytics();

      return ApiResponse.success(
        res,
        {
          analytics,
        },
        "Admin dashboard fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Admin Overview
 * ============================================================
 *
 * GET /api/v1/admin/overview
 *
 * Returns the complete analytics overview available to
 * administrative users.
 */

const getOverview =
  asyncHandler(
    async (req, res) => {
      const analytics =
        await analyticsService.getCompleteAnalytics();

      return ApiResponse.success(
        res,
        {
          analytics,
        },
        "Admin overview fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

const adminController =
  Object.freeze({
    getDashboard,
    getOverview,
  });

export default adminController;