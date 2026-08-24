import analyticsRepository from "../repositories/analytics.repository.js";

/**
 * ============================================================
 * Get Dashboard Analytics
 * ============================================================
 */

const getDashboardAnalytics =
  async () => {
    return analyticsRepository.getDashboardStats();
  };

/**
 * ============================================================
 * Get User Analytics
 * ============================================================
 */

const getUserAnalytics =
  async () => {
    return analyticsRepository.getUserStats();
  };

/**
 * ============================================================
 * Get Festival Analytics
 * ============================================================
 */

const getFestivalAnalytics =
  async () => {
    return analyticsRepository.getFestivalStats();
  };

/**
 * ============================================================
 * Get Event Analytics
 * ============================================================
 */

const getEventAnalytics =
  async () => {
    return analyticsRepository.getEventStats();
  };

/**
 * ============================================================
 * Get Registration Analytics
 * ============================================================
 */

const getRegistrationAnalytics =
  async () => {
    return analyticsRepository.getRegistrationStats();
  };

/**
 * ============================================================
 * Get Payment Analytics
 * ============================================================
 */

const getPaymentAnalytics =
  async () => {
    return analyticsRepository.getPaymentStats();
  };

/**
 * ============================================================
 * Get Ticket Analytics
 * ============================================================
 */

const getTicketAnalytics =
  async () => {
    return analyticsRepository.getTicketStats();
  };

/**
 * ============================================================
 * Get Accommodation Analytics
 * ============================================================
 */

const getAccommodationAnalytics =
  async () => {
    return analyticsRepository.getAccommodationStats();
  };

/**
 * ============================================================
 * Get Complete Analytics
 * ============================================================
 */

const getCompleteAnalytics =
  async () => {
    return analyticsRepository.getCompleteAnalytics();
  };

/**
 * ============================================================
 * Service Export
 * ============================================================
 */

const analyticsService =
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

export default analyticsService;