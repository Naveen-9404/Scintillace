import Razorpay from "razorpay";
import crypto from "crypto";

import env from "../config/env.js";

import ApiError from "./ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Razorpay Configuration
 * ============================================================
 */

const {
  razorpayKeyId,
  razorpayKeySecret,
  razorpayWebhookSecret,
} = env;

/**
 * ============================================================
 * Razorpay Instance
 * ============================================================
 */

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
});

/**
 * ============================================================
 * Create Razorpay Order
 * ============================================================
 *
 * Amount is received in major currency units.
 *
 * Example:
 *
 * ₹500
 * ↓
 * 50000 paise
 */

const createOrder = async ({
  amount,
  currency = "INR",
  receipt,
  notes = {},
}) => {
  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw new ApiError(
      "Invalid payment amount.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (
    typeof receipt !== "string" ||
    !receipt.trim()
  ) {
    throw new ApiError(
      "Payment receipt is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt: receipt.trim(),
    notes,
  });
};

/**
 * ============================================================
 * Verify Razorpay Checkout Signature
 * ============================================================
 */

const verifySignature = ({
  orderId,
  paymentId,
  signature,
}) => {
  if (
    !orderId ||
    !paymentId ||
    !signature
  ) {
    throw new ApiError(
      "Payment verification details are incomplete.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const generatedSignature =
    crypto
      .createHmac(
        "sha256",
        razorpayKeySecret,
      )
      .update(
        `${orderId}|${paymentId}`,
      )
      .digest("hex");

  const generatedBuffer =
    Buffer.from(
      generatedSignature,
      "utf8",
    );

  const receivedBuffer =
    Buffer.from(
      signature,
      "utf8",
    );

  if (
    generatedBuffer.length !==
    receivedBuffer.length
  ) {
    throw new ApiError(
      "Invalid payment signature.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (
    !crypto.timingSafeEqual(
      generatedBuffer,
      receivedBuffer,
    )
  ) {
    throw new ApiError(
      "Invalid payment signature.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return true;
};

/**
 * ============================================================
 * Verify Razorpay Webhook Signature
 * ============================================================
 */

const verifyWebhookSignature = ({
  rawBody,
  signature,
}) => {
  if (!razorpayWebhookSecret) {
    throw new Error(
      "RAZORPAY_WEBHOOK_SECRET is not configured.",
    );
  }

  if (
    !rawBody ||
    !signature
  ) {
    throw new ApiError(
      "Webhook verification details are incomplete.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const generatedSignature =
    crypto
      .createHmac(
        "sha256",
        razorpayWebhookSecret,
      )
      .update(rawBody)
      .digest("hex");

  const generatedBuffer =
    Buffer.from(
      generatedSignature,
      "utf8",
    );

  const receivedBuffer =
    Buffer.from(
      signature,
      "utf8",
    );

  if (
    generatedBuffer.length !==
    receivedBuffer.length
  ) {
    throw new ApiError(
      "Invalid webhook signature.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (
    !crypto.timingSafeEqual(
      generatedBuffer,
      receivedBuffer,
    )
  ) {
    throw new ApiError(
      "Invalid webhook signature.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return true;
};

/**
 * ============================================================
 * Fetch Razorpay Payment
 * ============================================================
 */

const fetchPayment = async (
  paymentId,
) => {
  if (!paymentId) {
    throw new ApiError(
      "Razorpay payment ID is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return razorpay.payments.fetch(
    paymentId,
  );
};

/**
 * ============================================================
 * Fetch Razorpay Order
 * ============================================================
 */

const fetchOrder = async (
  orderId,
) => {
  if (!orderId) {
    throw new ApiError(
      "Razorpay order ID is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return razorpay.orders.fetch(
    orderId,
  );
};

/**
 * ============================================================
 * Refund Razorpay Payment
 * ============================================================
 */

const refundPayment = async ({
  paymentId,
  amount = null,
  notes = {},
}) => {
  if (!paymentId) {
    throw new ApiError(
      "Razorpay payment ID is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const refundOptions = {
    notes,
  };

  if (amount !== null) {
    if (
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new ApiError(
        "Invalid refund amount.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    refundOptions.amount =
      Math.round(amount * 100);
  }

  return razorpay.payments.refund(
    paymentId,
    refundOptions,
  );
};

/**
 * ============================================================
 * Export
 * ============================================================
 */

const razorpayUtil =
  Object.freeze({
    razorpay,
    createOrder,
    verifySignature,
    verifyWebhookSignature,
    fetchPayment,
    fetchOrder,
    refundPayment,
  });

export default razorpayUtil;