import { apiClient } from "./axios";

/**
 * Register for an Event
 *
 * Individual:
 * {
 *   event: "EVENT_ID"
 * }
 *
 * Team:
 * {
 *   event: "EVENT_ID",
 *   teamId: "TEAM_ID"
 * }
 */
export const registerForEvent =
  async (payload) => {
    const { data } =
      await apiClient.post(
        "/v1/registrations",
        payload,
      );
    return data.data;
  };

/**
 * Register for an Event (Public / Accountless)
 */
export const publicRegisterForEvent =
  async (payload) => {
    // Send request without authorization requirement
    // (If token exists, it might be sent by apiClient but is ignored by the public endpoint)
    const { data } =
      await apiClient.post(
        "/v1/registrations/public",
        payload,
      );

    return data.data;
  };

/**
 * Get Public Registration Status (Guest)
 */
export const getGuestRegistrationStatus =
  async (id, guestToken) => {
    const { data } =
      await apiClient.get(
        `/v1/registrations/public/${id}/status`,
        {
          headers: {
            "X-Guest-Token": guestToken
          }
        }
      );
    return data.data;
  };

/**
 * Get Logged-in User Registrations
 */
export const getMyRegistrations =
  async () => {
    const { data } =
      await apiClient.get(
        "/v1/registrations/my",
      );

    return (
      data?.data?.registrations ||
      []
    );
  };

/**
 * Get Registration By ID
 */
export const getRegistration =
  async (id) => {
    const { data } =
      await apiClient.get(
        `/v1/registrations/${id}`,
      );

    return data.data.registration;
  };

/**
 * Cancel Registration
 */
export const cancelRegistration =
  async (id) => {
    const { data } =
      await apiClient.post(
        `/v1/registrations/${id}/cancel`,
      );

    return data.data.registration;
  };