import dotenv from "dotenv";

dotenv.config();

/**
 * ============================================================
 * Required Environment Variable
 * ============================================================
 */

const requireEnv = (
  value,
  name,
) => {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
};

/**
 * ============================================================
 * Environment Configuration
 * ============================================================
 */

const env = Object.freeze({
  /**
   * ============================================================
   * Application
   * ============================================================
   */

  nodeEnv:
    process.env.NODE_ENV ||
    "development",

  port:
    Number(process.env.PORT) ||
    5000,

  clientUrl:
    process.env.CLIENT_URL ||
    "http://localhost:5173",

  /**
   * ============================================================
   * Google Authentication
   * ============================================================
   */

  googleClientId:
  process.env.GOOGLE_CLIENT_ID || "",

  /**
   * ============================================================
   * MongoDB
   * ============================================================
   */

  mongoDbUri:
    requireEnv(
      process.env.MONGODB_URI,
      "MONGODB_URI",
    ),

  /**
   * ============================================================
   * JWT
   * ============================================================
   */

  accessTokenSecret:
    requireEnv(
      process.env.ACCESS_TOKEN_SECRET,
      "ACCESS_TOKEN_SECRET",
    ),

  refreshTokenSecret:
    requireEnv(
      process.env.REFRESH_TOKEN_SECRET,
      "REFRESH_TOKEN_SECRET",
    ),

  accessTokenExpiresIn:
    process.env.ACCESS_TOKEN_EXPIRES_IN ||
    "15m",

  refreshTokenExpiresIn:
    process.env.REFRESH_TOKEN_EXPIRES_IN ||
    "7d",

  /**
   * ============================================================
   * Razorpay
   * ============================================================
   */

  razorpayKeyId:
    requireEnv(
      process.env.RAZORPAY_KEY_ID,
      "RAZORPAY_KEY_ID",
    ),

  razorpayKeySecret:
    requireEnv(
      process.env.RAZORPAY_KEY_SECRET,
      "RAZORPAY_KEY_SECRET",
    ),

  razorpayWebhookSecret:
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    "",

  /**
   * ============================================================
   * Accommodation
   * ============================================================
   */


  /**
   * ============================================================
   * Logging
   * ============================================================
   */

  logLevel:
    process.env.LOG_LEVEL ||
    "info",
});

export default env;