import {
  useQuery,
} from "@tanstack/react-query";

import eventsApi from "../api/events";

/**
 * ============================================================
 * Event Query Keys
 * ============================================================
 */

export const EVENT_QUERY_KEYS =
  Object.freeze({
    all: ["events"],

    list: (params) => [
      "events",
      "list",
      params,
    ],

    detail: (eventId) => [
      "events",
      "detail",
      eventId,
    ],

    published: (params) => [
      "events",
      "published",
      params,
    ],

    openRegistration: (
      params,
    ) => [
      "events",
      "open-registration",
      params,
    ],

    upcoming: (params) => [
      "events",
      "upcoming",
      params,
    ],

    availability: (eventId) => [
      "events",
      "availability",
      eventId,
    ],

    search: (params) => [
      "events",
      "search",
      params,
    ],
  });

/**
 * ============================================================
 * Get Events
 * ============================================================
 */

export const useEvents = (
  params = {},
) => {
  return useQuery({
    queryKey:
      EVENT_QUERY_KEYS.list(
        params,
      ),

    queryFn: () =>
      eventsApi.getEvents(
        params,
      ),

    staleTime:
      60 * 1000,
  });
};

/**
 * ============================================================
 * Get Event By ID
 * ============================================================
 */

export const useEvent = (
  eventId,
) => {
  return useQuery({
    queryKey:
      EVENT_QUERY_KEYS.detail(
        eventId,
      ),

    queryFn: () =>
      eventsApi.getEventById(
        eventId,
      ),

    enabled:
      Boolean(eventId),

    staleTime:
      60 * 1000,
  });
};

/**
 * ============================================================
 * Get Published Events
 * ============================================================
 */

export const usePublishedEvents = (
  params = {},
) => {
  return useQuery({
    queryKey:
      EVENT_QUERY_KEYS.published(
        params,
      ),

    queryFn: () =>
      eventsApi.getPublishedEvents(
        params,
      ),

    staleTime:
      60 * 1000,
  });
};

/**
 * ============================================================
 * Get Open Registration Events
 * ============================================================
 */

export const useOpenRegistrationEvents =
  (
    params = {},
  ) => {
    return useQuery({
      queryKey:
        EVENT_QUERY_KEYS.openRegistration(
          params,
        ),

      queryFn: () =>
        eventsApi.getOpenRegistrationEvents(
          params,
        ),

      staleTime:
        30 * 1000,
    });
  };

/**
 * ============================================================
 * Get Upcoming Events
 * ============================================================
 */

export const useUpcomingEvents = (
  params = {},
) => {
  return useQuery({
    queryKey:
      EVENT_QUERY_KEYS.upcoming(
        params,
      ),

    queryFn: () =>
      eventsApi.getUpcomingEvents(
        params,
      ),

    staleTime:
      60 * 1000,
  });
};

/**
 * ============================================================
 * Get Event Availability
 * ============================================================
 */

export const useEventAvailability = (
  eventId,
) => {
  return useQuery({
    queryKey:
      EVENT_QUERY_KEYS.availability(
        eventId,
      ),

    queryFn: () =>
      eventsApi.getEventAvailability(
        eventId,
      ),

    enabled:
      Boolean(eventId),

    staleTime:
      30 * 1000,
  });
};

/**
 * ============================================================
 * Search Events
 * ============================================================
 */

export const useSearchEvents = (
  params = {},
) => {
  return useQuery({
    queryKey:
      EVENT_QUERY_KEYS.search(
        params,
      ),

    queryFn: () =>
      eventsApi.searchEvents(
        params,
      ),

    enabled:
      Boolean(
        params?.q?.trim(),
      ),

    staleTime:
      30 * 1000,
  });
};