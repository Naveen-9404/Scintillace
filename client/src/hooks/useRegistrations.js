import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  registerForEvent,
  getMyRegistrations,
  getRegistration,
  cancelRegistration,
} from "../api/registrations.api";

export const REGISTRATION_KEYS =
  Object.freeze({
    all: ["registrations"],

    mine: [
      "registrations",
      "mine",
    ],

    detail: (id) => [
      "registrations",
      "detail",
      id,
    ],
  });

/**
 * ============================================================
 * My Registrations
 * ============================================================
 */

export const useMyRegistrations =
  () =>
    useQuery({
      queryKey:
        REGISTRATION_KEYS.mine,

      queryFn:
        getMyRegistrations,

      staleTime: 30 * 1000,
    });

/**
 * ============================================================
 * Registration Details
 * ============================================================
 */

export const useRegistration =
  (registrationId) =>
    useQuery({
      queryKey:
        REGISTRATION_KEYS.detail(
          registrationId,
        ),

      queryFn: () =>
        getRegistration(
          registrationId,
        ),

      enabled:
        Boolean(
          registrationId,
        ),

      staleTime: 30 * 1000,
    });

/**
 * ============================================================
 * Create Registration
 * ============================================================
 */

export const useRegisterForEvent =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        registerForEvent,

      onSuccess: () => {
        queryClient.invalidateQueries(
          {
            queryKey:
              REGISTRATION_KEYS.all,
          },
        );
      },
    });
  };

/**
 * ============================================================
 * Cancel Registration
 * ============================================================
 */

export const useCancelRegistration =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        cancelRegistration,

      onSuccess: (
        _data,
        registrationId,
      ) => {
        queryClient.invalidateQueries(
          {
            queryKey:
              REGISTRATION_KEYS.all,
          },
        );

        queryClient.invalidateQueries(
          {
            queryKey:
              REGISTRATION_KEYS.detail(
                registrationId,
              ),
          },
        );
      },
    });
  };