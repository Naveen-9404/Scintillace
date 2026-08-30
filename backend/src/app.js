import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import corsConfig from "./config/cors.js";

import authRoutes from "./routes/auth.routes.js";
import festivalRoutes from "./routes/festival.routes.js";
import eventRoutes from "./routes/event.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import teamRoutes from "./routes/team.routes.js";
import accommodationRoutes from "./routes/accommodation.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import volunteerRoutes from "./routes/volunteer.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import ticketRoutes from "./routes/ticket.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import exportRoutes from "./routes/export.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import sponsorRoutes from "./routes/sponsor.routes.js";
import faqRoutes from "./routes/faq.routes.js";

import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import { generalLimiter } from "./middlewares/rateLimiters.js";
import mongoSanitize from "./middlewares/mongoSanitize.js";

const app = express();

if (process.env.NODE_ENV === "test") {
  app.use((req, res, next) => {
    req.headers.origin = "http://localhost:5173";
    next();
  });
}

/**
 * ============================================================
 * Security Middleware
 * ============================================================
 */

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
  }),
);

app.use(mongoSanitize);


app.use(cors(corsConfig));

/**
 * ============================================================
 * General Rate Limiter
 * ============================================================
 */
app.use("/api/", generalLimiter);

app.use(
  express.json({
    limit: "100kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "100kb",
  }),
);

app.use(cookieParser());

/**
 * ============================================================
 * Logging Middleware
 * ============================================================
 */

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

/**
 * ============================================================
 * Health Check
 * ============================================================
 */

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Scintillace API is running",

    data: {
      status: "ok",

      timestamp: new Date().toISOString(),

      environment: process.env.NODE_ENV || "development",
    },
  });
});

/**
 * ============================================================
 * API Routes
 * ============================================================
 */

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/festivals", festivalRoutes);

app.use("/api/v1/events", eventRoutes);

app.use("/api/v1/registrations", registrationRoutes);

app.use("/api/v1/teams", teamRoutes);

app.use("/api/v1/accommodation", accommodationRoutes);

app.use("/api/v1/payments", paymentRoutes);

app.use("/api/v1/announcements", announcementRoutes);
app.use("/api/v1/gallery", galleryRoutes);
app.use("/api/v1/volunteers", volunteerRoutes);
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/export", exportRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/sponsors", sponsorRoutes);
app.use("/api/v1/faqs", faqRoutes);

/**
 * ============================================================
 * Root Route
 * ============================================================
 */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Scintillace API",
    version: "1.0.0",
  });
});

/**
 * ============================================================
 * 404 Middleware
 * ============================================================
 */

app.use(notFound);

/**
 * ============================================================
 * Global Error Handler
 * ============================================================
 */

app.use(errorHandler);

export default app;
