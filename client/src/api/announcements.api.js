import { apiClient } from "./axios";

/**
 * Get published announcements.
 */
export const getPublishedAnnouncements = async (
  params = {},
) => {
  const { data } =
    await apiClient.get(
      "/v1/announcements/published",
      {
        params,
      },
    );

  return data?.data || {
    announcements: [],
    pagination: {},
  };
};

/**
 * Search published announcements.
 */
export const searchAnnouncements =
  async (
    query,
    params = {},
  ) => {
    const { data } =
      await apiClient.get(
        "/v1/announcements/search",
        {
          params: {
            q: query,
            ...params,
          },
        },
      );

    return data?.data || {
      announcements: [],
      pagination: {},
    };
  };

/**
 * Get announcements for an event.
 */
export const getEventAnnouncements =
  async (
    eventId,
    params = {},
  ) => {
    const { data } =
      await apiClient.get(
        `/v1/announcements/event/${eventId}`,
        {
          params,
        },
      );

    return data?.data || {
      announcements: [],
      pagination: {},
    };
  };

/**
 * Get announcements for a festival.
 */
export const getFestivalAnnouncements =
  async (
    festivalId,
    params = {},
  ) => {
    const { data } =
      await apiClient.get(
        `/v1/announcements/festival/${festivalId}`,
        {
          params,
        },
      );

    return data?.data || {
      announcements: [],
      pagination: {},
    };
  };

/**
 * ==========================================================
 * ADMIN
 * ==========================================================
 */

/**
 * Get all announcements.
 */
export const getAllAnnouncements =
  async (params = {}) => {
    const { data } =
      await apiClient.get(
        "/v1/announcements",
        {
          params,
        },
      );

    return data?.data || {
      announcements: [],
      pagination: {},
    };
  };

/**
 * Get announcement by ID.
 */
export const getAnnouncementById =
  async (id) => {
    const { data } =
      await apiClient.get(
        `/v1/announcements/${id}`,
      );

    return data?.data?.announcement;
  };

/**
 * Create announcement.
 */
export const createAnnouncement =
  async (payload) => {
    const { data } =
      await apiClient.post(
        "/v1/announcements",
        payload,
      );

    return data?.data?.announcement;
  };

/**
 * Update announcement.
 */
export const updateAnnouncement =
  async (
    id,
    payload,
  ) => {
    const { data } =
      await apiClient.put(
        `/v1/announcements/${id}`,
        payload,
      );

    return data?.data?.announcement;
  };

/**
 * Publish announcement.
 */
export const publishAnnouncement =
  async (id) => {
    const { data } =
      await apiClient.patch(
        `/v1/announcements/${id}/publish`,
      );

    return data?.data?.announcement;
  };

/**
 * Archive announcement.
 */
export const archiveAnnouncement =
  async (id) => {
    const { data } =
      await apiClient.patch(
        `/v1/announcements/${id}/archive`,
      );

    return data?.data?.announcement;
  };

/**
 * Delete announcement.
 */
export const deleteAnnouncement =
  async (id) => {
    const { data } =
      await apiClient.delete(
        `/v1/announcements/${id}`,
      );

    return data;
  };

const announcementsApi =
  Object.freeze({
    getPublishedAnnouncements,
    searchAnnouncements,
    getEventAnnouncements,
    getFestivalAnnouncements,

    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    publishAnnouncement,
    archiveAnnouncement,
    deleteAnnouncement,
  });

export default announcementsApi;