import rateLimit from "express-rate-limit";
import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

const isTestEnv = process.env.NODE_ENV === "test";

// Helper for consistent rate limit responses
const createRateLimitHandler = (message) => {
  return (req, res, next) => {
    next(new ApiError(message, HTTP_STATUS.TOO_MANY_REQUESTS));
  };
};

/**
 * General API Rate Limiter
 * 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTestEnv,
  handler: createRateLimitHandler("Too many requests, please try again later."),
});

/**
 * Auth Rate Limiter (login, register, refresh)
 * 10 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTestEnv,
  handler: createRateLimitHandler("Too many authentication attempts, please try again later."),
});

/**
 * Payment Order Limiter
 * 10 requests per 15 minutes
 */
export const paymentOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTestEnv,
  handler: createRateLimitHandler("Too many payment orders initiated, please try again later."),
});

/**
 * Payment Webhook & Verify Limiter
 * 20 requests per 15 minutes
 */
export const paymentVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTestEnv,
  handler: createRateLimitHandler("Too many payment verifications, please try again later."),
});

/**
 * QR Scanner Limiter
 * 60 requests per 1 minute (Fast scanning at desks)
 */
export const qrScannerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => isTestEnv,
  handler: createRateLimitHandler("Too many tickets scanned, please slow down."),
});

export default {
  generalLimiter,
  authLimiter,
  paymentOrderLimiter,
  paymentVerifyLimiter,
  qrScannerLimiter,
};
