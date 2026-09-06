import express from "express";

import certificateController from "../controllers/certificate.controller.js";

import authenticate from "../middlewares/authenticate.js";
import authorize from "../middlewares/authorize.js";
import validateRequest from "../middlewares/validateRequest.js";
import verifyGuestToken from "../middlewares/verifyGuestToken.js";

import {
  createCertificateValidator,
  certificateIdValidator,
  downloadCertificateValidator,
  certificateNumberValidator,
  verificationCodeValidator,
  eventCertificateValidator,
  festivalCertificateValidator,
  certificateQueryValidator,
  revokeCertificateValidator,
} from "../validators/certificate.validator.js";

import ROLES from "../constants/roles.js";

const router =
  express.Router();

/**
 * ============================================================
 * PUBLIC CERTIFICATE ROUTES
 * ============================================================
 */

router.get(
  "/verify/:verificationCode",
  verificationCodeValidator,
  validateRequest,
  certificateController.verifyCertificate,
);

router.get(
  "/number/:certificateNumber",
  certificateNumberValidator,
  validateRequest,
  certificateController.getCertificateByNumber,
);

router.get(
  "/public/:registrationId",
  verifyGuestToken,
  certificateController.getPublicCertificates,
);

router.get(
  "/public/:registrationId/download/:certificateId",
  verifyGuestToken,
  downloadCertificateValidator,
  validateRequest,
  certificateController.downloadPublicCertificate,
);

/**
 * ============================================================
 * AUTHENTICATED USER ROUTES
 * ============================================================
 */

router.get(
  "/me",
  authenticate,
  certificateQueryValidator,
  validateRequest,
  certificateController.getMyCertificates,
);

/**
 * ============================================================
 * ADMIN / FACULTY ROUTES
 * ============================================================
 */

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  certificateQueryValidator,
  validateRequest,
  certificateController.getAllCertificates,
);

router.get(
  "/event/:eventId",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  eventCertificateValidator,
  validateRequest,
  certificateController.getCertificatesByEvent,
);

/**
 * ============================================================
 * FESTIVAL CERTIFICATE DISBURSAL
 * ============================================================
 *
 * IMPORTANT:
 *
 * This route must appear BEFORE:
 *
 * /:id
 *
 * because "festival" would otherwise be interpreted as an ID.
 *
 * POST
 * /api/v1/certificates/festival/:festivalId/disburse
 *
 * This is the admin approval action.
 */

router.post(
  "/festival/:festivalId/disburse",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  festivalCertificateValidator,
  validateRequest,
  certificateController.disburseFestivalCertificates,
);

router.get(
  "/festival/:festivalId",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  festivalCertificateValidator,
  validateRequest,
  certificateController.getCertificatesByFestival,
);

/**
 * ============================================================
 * Certificate QR
 * ============================================================
 */

router.get(
  "/:id/qr",
  authenticate,
  certificateIdValidator,
  validateRequest,
  certificateController.getCertificateQR,
);

/**
 * ============================================================
 * Certificate By ID
 * ============================================================
 */

router.get(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  certificateIdValidator,
  validateRequest,
  certificateController.getCertificateById,
);

/**
 * ============================================================
 * Create Certificate
 * ============================================================
 */

router.post(
  "/",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  createCertificateValidator,
  validateRequest,
  certificateController.createCertificate,
);

/**
 * ============================================================
 * Issue Certificate
 * ============================================================
 */

router.patch(
  "/:id/issue",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  certificateIdValidator,
  validateRequest,
  certificateController.issueCertificate,
);

/**
 * ============================================================
 * Revoke Certificate
 * ============================================================
 */

router.patch(
  "/:id/revoke",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
    ROLES.FACULTY,
  ),
  revokeCertificateValidator,
  validateRequest,
  certificateController.revokeCertificate,
);

/**
 * ============================================================
 * Delete Certificate
 * ============================================================
 */

router.delete(
  "/:id",
  authenticate,
  authorize(
    ROLES.SUPER_ADMIN,
  ),
  certificateIdValidator,
  validateRequest,
  certificateController.deleteCertificate,
);

export default router;