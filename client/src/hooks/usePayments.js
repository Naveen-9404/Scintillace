import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createEventPaymentOrder,
  createAccommodationPaymentOrder,
  verifyPayment,
  getMyPayments,
  getPayment,
  downloadReceipt,
} from "../api/payments";

/**
 * ============================================================
 * Payment Query Keys
 * ============================================================
 */

export const PAYMENT_KEYS =
  Object.freeze({
    all: ["payments"],

    mine: [
      "payments",
      "mine",
    ],

    detail: (id) => [
      "payments",
      "detail",
      id,
    ],
  });

/**
 * ============================================================
 * My Payments
 * ============================================================
 */

export const useMyPayments =
  (params = {}) =>
    useQuery({
      queryKey: [
        ...PAYMENT_KEYS.mine,
        params,
      ],

      queryFn: () =>
        getMyPayments(params),

      staleTime:
        30 * 1000,
    });

/**
 * ============================================================
 * Payment Details
 * ============================================================
 */

export const usePayment = (
  paymentId,
) =>
  useQuery({
    queryKey:
      PAYMENT_KEYS.detail(
        paymentId,
      ),

    queryFn: () =>
      getPayment(paymentId),

    enabled:
      Boolean(paymentId),
  });

/**
 * ============================================================
 * Create Event Payment Order
 * ============================================================
 */

export const useCreateEventPaymentOrder =
  () =>
    useMutation({
      mutationFn:
        createEventPaymentOrder,
    });

/**
 * ============================================================
 * Create Accommodation Payment Order
 * ============================================================
 *
 * Creates a Razorpay order for an existing
 * accommodation booking.
 */

export const useCreateAccommodationPaymentOrder =
  () =>
    useMutation({
      mutationFn:
        createAccommodationPaymentOrder,
    });

/**
 * ============================================================
 * Verify Payment
 * ============================================================
 *
 * Used for:
 *
 * - Event payments
 * - Accommodation payments
 *
 * After successful verification, invalidate all related
 * queries so the frontend immediately reflects the
 * successful payment.
 */

export const useVerifyPayment =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn:
        verifyPayment,

      onSuccess: (
        data,
      ) => {
        /**
         * ====================================================
         * Payment Queries
         * ====================================================
         */

        queryClient.invalidateQueries({
          queryKey:
            PAYMENT_KEYS.all,
        });

        /**
         * ====================================================
         * Registration Queries
         * ====================================================
         */

        queryClient.invalidateQueries({
          queryKey: [
            "registrations",
          ],
        });

        /**
         * ====================================================
         * Ticket Queries
         * ====================================================
         */

        queryClient.invalidateQueries({
          queryKey: [
            "tickets",
          ],
        });

        /**
         * ====================================================
         * Accommodation Queries
         * ====================================================
         *
         * Important:
         *
         * After accommodation payment succeeds,
         * the booking should immediately update from:
         *
         * Pending
         *
         * to:
         *
         * Paid
         */

        queryClient.invalidateQueries({
          queryKey: [
            "accommodation",
          ],
        });

        queryClient.invalidateQueries({
          queryKey: [
            "accommodations",
          ],
        });

        /**
         * ====================================================
         * Return Backend Response
         * ====================================================
         */

        return data;
      },
    });
  };

/**
 * ============================================================
 * Download Payment Receipt
 * ============================================================
 */

export const useDownloadReceipt =
  () =>
    useMutation({
      mutationFn:
        downloadReceipt,
    });