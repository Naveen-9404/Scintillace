import crypto from "crypto";

import ticketRepository from "../repositories/ticket.repository.js";
import certificateRepository from "../repositories/certificate.repository.js";

import qrUtil from "../utils/qr.js";
import certificateUtil from "../utils/certificate.js";

import ApiError from "../utils/ApiError.js";
import HTTP_STATUS from "../constants/httpStatus.js";

/**
 * ============================================================
 * Generate Secure Token
 * ============================================================
 */

const generateSecureToken = (
  bytes = 32,
) => {
  return crypto
    .randomBytes(bytes)
    .toString("hex");
};

/**
 * ============================================================
 * Generate Ticket QR Token
 * ============================================================
 */

const generateTicketToken = () => {
  return generateSecureToken(32);
};

/**
 * ============================================================
 * Generate Certificate Verification Code
 * ============================================================
 */

const generateCertificateVerificationCode =
  () => {
    return generateSecureToken(
      24,
    ).toUpperCase();
  };

/**
 * ============================================================
 * Generate Ticket QR
 * ============================================================
 */

const generateTicketQR =
  async (ticket) => {
    if (!ticket) {
      throw new ApiError(
        "Ticket is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!ticket.ticketNumber) {
      throw new ApiError(
        "Ticket number is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (!ticket.qrToken) {
      throw new ApiError(
        "Ticket QR token is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const payload =
      qrUtil.generateTicketQRPayload(
        {
          ticketNumber:
            ticket.ticketNumber,

          qrToken:
            ticket.qrToken,
        },
      );

    const qrCode =
      await qrUtil.generateQRDataURL(
        payload,
      );

    return {
      payload,
      qrCode,
    };
  };

/**
 * ============================================================
 * Generate Certificate QR
 * ============================================================
 *
 * The QR payload contains:
 *
 * - Certificate number
 * - Verification code
 *
 * It does not contain participant private information.
 * ============================================================
 */

const generateCertificateQR =
  async (certificate) => {
    if (!certificate) {
      throw new ApiError(
        "Certificate is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      !certificate.certificateNumber
    ) {
      throw new ApiError(
        "Certificate number is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      !certificate.verificationCode
    ) {
      throw new ApiError(
        "Certificate verification code is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const payload =
      certificateUtil.buildCertificateQRPayload(
        {
          certificateNumber:
            certificate.certificateNumber,

          verificationCode:
            certificate.verificationCode,
        },
      );

    const qrCode =
      await qrUtil.generateQRDataURL(
        payload,
      );

    return {
      payload,
      qrCode,
    };
  };

/**
 * ============================================================
 * Generate Generic QR
 * ============================================================
 */

const generateQR = async (
  data,
  options = {},
) => {
  if (
    data === undefined ||
    data === null ||
    data === ""
  ) {
    throw new ApiError(
      "QR data is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return qrUtil.generateQRDataURL(
    data,
    options,
  );
};

/**
 * ============================================================
 * Generate QR Buffer
 * ============================================================
 *
 * Used by PDF generation.
 * ============================================================
 */

const generateQRBuffer = async (
  data,
  options = {},
) => {
  if (
    data === undefined ||
    data === null ||
    data === ""
  ) {
    throw new ApiError(
      "QR data is required.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return qrUtil.generateQRBuffer(
    data,
    options,
  );
};

/**
 * ============================================================
 * Parse QR Payload
 * ============================================================
 */

const parseQR = (
  payload,
) => {
  try {
    return qrUtil.parseQRPayload(
      payload,
    );
  } catch (error) {
    throw new ApiError(
      error.message ||
        "Invalid QR payload.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

/**
 * ============================================================
 * Verify Ticket QR
 * ============================================================
 *
 * Verification does NOT perform check-in.
 *
 * Check-in remains a separate operation.
 * ============================================================
 */

const verifyTicketQR = async (
  payload,
) => {
  const parsed =
    parseQR(payload);

  if (
    parsed.type !==
    qrUtil.QR_TYPES.TICKET
  ) {
    throw new ApiError(
      "Invalid Scintillace ticket QR.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (
    !parsed.ticketNumber ||
    !parsed.token
  ) {
    throw new ApiError(
      "Incomplete ticket QR payload.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const ticket =
    await ticketRepository.findByTicketNumberWithQrToken(
      parsed.ticketNumber,
    );

  if (!ticket) {
    throw new ApiError(
      "Ticket not found.",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  if (
    ticket.qrToken !==
    parsed.token
  ) {
    throw new ApiError(
      "Invalid ticket QR token.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  if (
    ticket.status ===
    "CANCELLED"
  ) {
    throw new ApiError(
      "Ticket has been cancelled.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (
    ticket.status ===
    "EXPIRED"
  ) {
    throw new ApiError(
      "Ticket has expired.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  return ticket;
};

/**
 * ============================================================
 * Verify Certificate QR
 * ============================================================
 *
 * Certificate QR verification is public.
 *
 * A certificate is valid only when:
 *
 * 1. QR structure is valid
 * 2. Certificate exists
 * 3. Certificate number matches
 * 4. Verification code matches
 * 5. Certificate status is ISSUED
 *
 * GENERATED certificates are not considered officially valid.
 * REVOKED certificates are invalid.
 * ============================================================
 */

const verifyCertificateQR =
  async (payload) => {
    const parsed =
      parseQR(payload);

    if (
      parsed.type !==
      qrUtil.QR_TYPES.CERTIFICATE
    ) {
      throw new ApiError(
        "Invalid Scintillace certificate QR.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      !parsed.certificateNumber ||
      !parsed.verificationCode
    ) {
      throw new ApiError(
        "Incomplete certificate QR payload.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const certificate =
      await certificateRepository.findByCertificateNumberWithVerificationCode(
        parsed.certificateNumber,
      );

    if (!certificate) {
      throw new ApiError(
        "Certificate not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const storedCode =
      certificate.verificationCode;

    const suppliedCode =
      certificateUtil.normalizeVerificationCode(
        parsed.verificationCode,
      );

    if (
      storedCode !==
      suppliedCode
    ) {
      throw new ApiError(
        "Invalid certificate verification code.",
        HTTP_STATUS.UNAUTHORIZED,
      );
    }

    if (
      certificate.status ===
      "REVOKED"
    ) {
      throw new ApiError(
        "Certificate has been revoked.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      certificate.status !==
      "ISSUED"
    ) {
      throw new ApiError(
        "Certificate has not been officially issued.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return certificate;
  };

/**
 * ============================================================
 * Export
 * ============================================================
 */

const qrService =
  Object.freeze({
    generateTicketToken,

    generateCertificateVerificationCode,

    generateTicketQR,
    generateCertificateQR,

    generateQR,
    generateQRBuffer,

    parseQR,

    verifyTicketQR,
    verifyCertificateQR,
  });

export default qrService;