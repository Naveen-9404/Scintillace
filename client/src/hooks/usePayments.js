import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
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



export const useDownloadReceipt =
  () =>
    useMutation({
      mutationFn:
        downloadReceipt,
    });