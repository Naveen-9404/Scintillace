import { Router } from "express";

import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";

import festivalRoutes from "./festival.routes.js";
import eventRoutes from "./event.routes.js";
import registrationRoutes from "./registration.routes.js";
import teamRoutes from "./team.routes.js";
import accommodationRoutes from "./accommodation.routes.js";
import paymentRoutes from "./payment.routes.js";
import announcementRoutes from "./announcement.routes.js";
import galleryRoutes from "./gallery.routes.js";
import volunteerRoutes from "./volunteer.routes.js";
import certificateRoutes from "./certificate.routes.js";
import ticketRoutes from "./ticket.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import exportRoutes from "./export.routes.js";
import adminRoutes from "./admin.routes.js";
import sponsorRoutes from "./sponsor.routes.js";
import faqRoutes from "./faq.routes.js";

const router = Router();

/**
 * ============================================================
 * HEALTH
 * ============================================================
 */

router.use("/v1", healthRoutes);

/**
 * ============================================================
 * AUTHENTICATION
 * ============================================================
 */

router.use("/v1/auth", authRoutes);

/**
 * ============================================================
 * FESTIVALS
 * ============================================================
 */

router.use("/v1/festivals", festivalRoutes);

/**
 * ============================================================
 * EVENTS
 * ============================================================
 */

router.use("/v1/events", eventRoutes);

/**
 * ============================================================
 * REGISTRATIONS
 * ============================================================
 */

router.use("/v1/registrations", registrationRoutes);

/**
 * ============================================================
 * TEAMS
 * ============================================================
 */

router.use("/v1/teams", teamRoutes);

/**
 * ============================================================
 * ACCOMMODATION
 * ============================================================
 */

router.use("/v1/accommodation", accommodationRoutes);

/**
 * ============================================================
 * PAYMENTS
 * ============================================================
 */

router.use("/v1/payments", paymentRoutes);

/**
 * ============================================================
 * ANNOUNCEMENTS
 * ============================================================
 */

router.use("/v1/announcements", announcementRoutes);

/**
 * ============================================================
 * GALLERY
 * ============================================================
 */

router.use("/v1/gallery", galleryRoutes);

/**
 * ============================================================
 * VOLUNTEERS
 * ============================================================
 */

router.use("/v1/volunteers", volunteerRoutes);

/**
 * ============================================================
 * CERTIFICATES
 * ============================================================
 */

router.use("/v1/certificates", certificateRoutes);

/**
 * ============================================================
 * TICKETS / QR
 * ============================================================
 */

router.use("/v1/tickets", ticketRoutes);

/**
 * ============================================================
 * ANALYTICS
 * ============================================================
 */

router.use("/v1/analytics", analyticsRoutes);

/**
 * ============================================================
 * DATA EXPORT
 * ============================================================
 */

router.use("/v1/export", exportRoutes);

router.use("/v1/admin", adminRoutes);

router.use("/v1/sponsors", sponsorRoutes);
router.use("/v1/faqs", faqRoutes);

/**
 * ============================================================
 * EXPORT
 * ============================================================
 */

export default router;
