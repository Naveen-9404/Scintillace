import { apiClient } from "./axios";

/**
 * Get registrations belonging to
 * the currently authenticated user.
 *
 * GET /api/v1/registrations/my
 */
export const getMyRegistrations = async () => {
  const { data } = await apiClient.get(
    "/v1/registrations/my"
  );

  return data.data.registrations;
};

/**
 * Get certificates belonging to
 * the currently authenticated user.
 *
 * GET /api/v1/certificates/me
 */
export const getMyCertificates = async () => {
  const { data } = await apiClient.get(
    "/v1/certificates/me"
  );

  return data.data.certificates;
};

/**
 * Get upcoming published events.
 *
 * GET /api/v1/events/upcoming
 */
export const getUpcomingEvents = async () => {
  const { data } = await apiClient.get(
    "/v1/events/upcoming"
  );

  return data.data.events;
};