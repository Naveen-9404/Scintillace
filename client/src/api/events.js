import { apiClient } from "./axios";

/**
 * ============================================================
 * Get Events
 * ============================================================
 *
 * GET /api/v1/events
 */

const getEvents = async (params = {}) => {
  const response = await apiClient.get(
    "/v1/events",
    {
      params,
    },
  );

  return response.data;
};

/**
 * ============================================================
 * Get Event By ID
 * ============================================================
 *
 * GET /api/v1/events/:id
 *
 * The backend response may be wrapped as:
 *
 * {
 *   success: true,
 *   data: {
 *     event: {...}
 *   }
 * }
 *
 * This function normalizes the response so the
 * React component receives the actual event object.
 */

const getEventById = async (eventId) => {
  const response = await apiClient.get(
    `/v1/events/${eventId}`,
  );

  const body = response.data;

  return (
    body?.data?.event ??
    body?.data ??
    body?.event ??
    body
  );
};

/**
 * ============================================================
 * Get Published Events
 * ============================================================
 *
 * GET /api/v1/events/published
 */

const getPublishedEvents = async (
  params = {},
) => {
  const response = await apiClient.get(
    "/v1/events/published",
    {
      params,
    },
  );

  return response.data;
};

/**
 * ============================================================
 * Get Open Registration Events
 * ============================================================
 *
 * GET /api/v1/events/open-registration
 */

const getOpenRegistrationEvents =
  async (params = {}) => {
    const response = await apiClient.get(
      "/v1/events/open-registration",
      {
        params,
      },
    );

    return response.data;
  };

/**
 * ============================================================
 * Get Upcoming Events
 * ============================================================
 *
 * GET /api/v1/events/upcoming
 */

const getUpcomingEvents = async (
  params = {},
) => {
  const response = await apiClient.get(
    "/v1/events/upcoming",
    {
      params,
    },
  );

  return response.data;
};

/**
 * ============================================================
 * Search Events
 * ============================================================
 *
 * GET /api/v1/events/search?q=...
 */

const searchEvents = async (
  params = {},
) => {
  const response = await apiClient.get(
    "/v1/events/search",
    {
      params,
    },
  );

  return response.data;
};

/**
 * ============================================================
 * Get Event Availability
 * ============================================================
 *
 * GET /api/v1/events/:id/availability
 */

const getEventAvailability = async (
  eventId,
) => {
  const response = await apiClient.get(
    `/v1/events/${eventId}/availability`,
  );

  return response.data;
};

/**
 * ============================================================
 * API Export
 * ============================================================
 */

const eventsApi = Object.freeze({
  getEvents,
  getEventById,
  getPublishedEvents,
  getOpenRegistrationEvents,
  getUpcomingEvents,
  searchEvents,
  getEventAvailability,
});

export {
  getEvents,
  getEventById,
  getPublishedEvents,
  getOpenRegistrationEvents,
  getUpcomingEvents,
  searchEvents,
  getEventAvailability,
};

export default eventsApi;