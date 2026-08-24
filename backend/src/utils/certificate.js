/**
 * ============================================================
 * Certificate Utility
 * ============================================================
 *
 * Reusable certificate helpers.
 *
 * Business operations remain inside
 * certificate.service.js.
 * ============================================================
 */

/**
 * ============================================================
 * Normalize Certificate Number
 * ============================================================
 */

const normalizeCertificateNumber = (
  certificateNumber,
) => {
  if (
    typeof certificateNumber !== "string" ||
    !certificateNumber.trim()
  ) {
    throw new Error(
      "Certificate number is required.",
    );
  }

  return certificateNumber
    .trim()
    .toUpperCase();
};

/**
 * ============================================================
 * Normalize Verification Code
 * ============================================================
 */

const normalizeVerificationCode = (
  verificationCode,
) => {
  if (
    typeof verificationCode !== "string" ||
    !verificationCode.trim()
  ) {
    throw new Error(
      "Verification code is required.",
    );
  }

  return verificationCode
    .trim()
    .toUpperCase();
};

/**
 * ============================================================
 * Build Verification URL
 * ============================================================
 */

const buildVerificationUrl = (
  verificationCode,
  baseUrl =
    process.env.FRONTEND_URL,
) => {
  const normalizedCode =
    normalizeVerificationCode(
      verificationCode,
    );

  if (
    typeof baseUrl !== "string" ||
    !baseUrl.trim()
  ) {
    throw new Error(
      "Frontend URL is not configured.",
    );
  }

  const normalizedBaseUrl =
    baseUrl
      .trim()
      .replace(/\/+$/, "");

  return `${normalizedBaseUrl}/certificates/verify/${encodeURIComponent(
    normalizedCode,
  )}`;
};

/**
 * ============================================================
 * Build Certificate Filename
 * ============================================================
 */

const buildCertificateFilename = (
  certificateNumber,
) => {
  const normalizedNumber =
    normalizeCertificateNumber(
      certificateNumber,
    );

  const safeNumber =
    normalizedNumber.replace(
      /[^A-Z0-9_-]/g,
      "-",
    );

  return `SCINTILLACE-CERT-${safeNumber}.pdf`;
};

/**
 * ============================================================
 * Build Certificate QR Payload
 * ============================================================
 *
 * Only verification information is placed inside the QR.
 *
 * No:
 * - email
 * - phone
 * - password
 * - private participant information
 */

const buildCertificateQRPayload = ({
  certificateNumber,
  verificationCode,
}) => {
  return JSON.stringify({
    type:
      "SCINTILLACE_CERTIFICATE",

    certificateNumber:
      normalizeCertificateNumber(
        certificateNumber,
      ),

    verificationCode:
      normalizeVerificationCode(
        verificationCode,
      ),
  });
};

/**
 * ============================================================
 * Build Certificate Metadata
 * ============================================================
 */

const buildCertificateMetadata = ({
  certificateNumber,
  certificateType =
    "PARTICIPATION",
  position = "",
  user = null,
  event = null,
  festival = null,
  issuedAt = new Date(),
  verificationCode,
  verificationUrl = "",
}) => {
  return {
    certificateNumber:
      normalizeCertificateNumber(
        certificateNumber,
      ),

    certificateType,

    position:
      typeof position === "string"
        ? position.trim()
        : "",

    participant: {
      name:
        user?.fullName || "",

      email:
        user?.email || "",

      collegeId:
        user?.collegeId || "",
    },

    event: {
      id:
        event?.id ||
        event?._id ||
        null,

      title:
        event?.title || "",

      category:
        event?.category || "",

      type:
        event?.type || "",
    },

    festival: {
      id:
        festival?.id ||
        festival?._id ||
        null,

      title:
        festival?.title || "",
    },

    issuedAt,

    verificationCode:
      normalizeVerificationCode(
        verificationCode,
      ),

    verificationUrl,
  };
};

/**
 * ============================================================
 * Certificate Type Label
 * ============================================================
 */

const getCertificateTypeLabel = (
  certificateType,
) => {
  const labels = {
    PARTICIPATION:
      "Certificate of Participation",

    WINNER:
      "Winner Certificate",

    RUNNER_UP:
      "Runner-Up Certificate",

    VOLUNTEER:
      "Volunteer Certificate",

    ORGANIZER:
      "Organizer Certificate",
  };

  return (
    labels[certificateType] ||
    "Certificate"
  );
};

/**
 * ============================================================
 * Validate Certificate Status
 * ============================================================
 */

const isValidCertificateStatus = (
  status,
) => {
  return [
    "GENERATED",
    "ISSUED",
    "REVOKED",
  ].includes(status);
};

/**
 * ============================================================
 * Certificate Verification State
 * ============================================================
 */

const isCertificateVerifiable = (
  certificate,
) => {
  if (!certificate) {
    return false;
  }

  return (
    certificate.status === "ISSUED"
  );
};

/**
 * ============================================================
 * Export
 * ============================================================
 */

const certificateUtil =
  Object.freeze({
    normalizeCertificateNumber,

    normalizeVerificationCode,

    buildVerificationUrl,

    buildCertificateFilename,

    buildCertificateQRPayload,

    buildCertificateMetadata,

    getCertificateTypeLabel,

    isValidCertificateStatus,

    isCertificateVerifiable,
  });

export default certificateUtil;