import analyticsService from "../services/analytics.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Dashboard Analytics
 * ============================================================
 *
 * GET /api/v1/analytics/dashboard
 */

const getDashboardAnalytics =
  asyncHandler(
    async (req, res) => {
      const analytics =
        await analyticsService.getDashboardAnalytics();

      return ApiResponse.success(
        res,
        {
          analytics,
        },
        "Dashboard analytics fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * User Analytics
 * ============================================================
 *
 * GET /api/v1/analytics/users
 */

const getUserAnalytics =
  asyncHandler(
    async (req, res) => {
      const analytics =
        await analyticsService.getUserAnalytics();

      return ApiResponse.success(
        res,
        {
          analytics,
        },
        "User analytics fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Festival Analytics
 * ============================================================
 *
 * GET /api/v1/analytics/festivals
 */

const getFestivalAnalytics =
  asyncHandler(
    async (req, res) => {
      const analytics =
        await analyticsService.getFestivalAnalytics();

      return ApiResponse.success(
        res,
        {
          analytics,
        },
        "Festival analytics fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Event Analytics
 * ============================================================
 *
 * GET /api/v1/analytics/events
 */

const getEventAnalytics =
  asyncHandler(
    async (req, res) => {
      const analytics =
        await analyticsService.getEventAnalytics();

      return ApiResponse.success(
        res,
        {
          analytics,
        },
        "Event analytics fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Registration Analytics
 * ============================================================
 *
 * GET /api/v1/analytics/registrations
 */

const getRegistrationAnalytics =
  asyncHandler(
    async (req, res) => {
      const analytics =
        await analyticsService.getRegistrationAnalytics();

      return ApiResponse.success(
        res,
        {
          analytics,
        },
        "Registration analytics fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Payment Analytics
 * ============================================================
 *
 * GET /api/v1/analytics/payments
 */

const getPaymentAnalytics =
  asyncHandler(
    async (req, res) => {
      const analytics =
        await analyticsService.getPaymentAnalytics();

      return ApiResponse.success(
        res,
        {
          analytics,
        },
        "Payment analytics fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Ticket Analytics
 * ============================================================
 *
 * GET /api/v1/analytics/tickets
 */

const getTicketAnalytics =
  asyncHandler(
    async (req, res) => {
      const analytics =
        await analyticsService.getTicketAnalytics();

      return ApiResponse.success(
        res,
        {
          analytics,
        },
        "Ticket analytics fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Accommodation Analytics
 * ============================================================
 *
 * GET /api/v1/analytics/accommodation
 */

const getAccommodationAnalytics =
  asyncHandler(
    async (req, res) => {
      const analytics =
        await analyticsService.getAccommodationAnalytics();

      return ApiResponse.success(
        res,
        {
          analytics,
        },
        "Accommodation analytics fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Complete Analytics
 * ============================================================
 *
 * GET /api/v1/analytics
 */

const getCompleteAnalytics =
  asyncHandler(
    async (req, res) => {
      const analytics =
        await analyticsService.getCompleteAnalytics();

      return ApiResponse.success(
        res,
        {
          analytics,
        },
        "Complete analytics fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Controller Export
 * ============================================================
 */

const analyticsController =
  Object.freeze({
    getDashboardAnalytics,

    getUserAnalytics,

    getFestivalAnalytics,

    getEventAnalytics,

    getRegistrationAnalytics,

    getPaymentAnalytics,

    getTicketAnalytics,

    getAccommodationAnalytics,

    getCompleteAnalytics,
  });

export default analyticsController;