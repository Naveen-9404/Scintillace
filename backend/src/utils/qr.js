import QRCode from "qrcode";

/**
 * ============================================================
 * QR Payload Types
 * ============================================================
 */

const QR_TYPES = Object.freeze({
  TICKET: "SCINTILLACE_TICKET",
  CERTIFICATE: "SCINTILLACE_CERTIFICATE",
});

/**
 * ============================================================
 * Normalize QR Value
 * ============================================================
 */

const normalizeValue = (
  value,
  fieldName,
  { uppercase = true } = {},
) => {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `${fieldName} is required.`,
    );
  }

  const normalized =
    value.trim();

  return uppercase
    ? normalized.toUpperCase()
    : normalized;
};

/**
 * ============================================================
 * Generate Ticket QR Payload
 * ============================================================
 *
 * Contains only:
 *
 * - Ticket number
 * - Ticket verification token
 *
 * No sensitive participant information is included.
 * ============================================================
 */

const generateTicketQRPayload = ({
  ticketNumber,
  qrToken,
}) => {
  const normalizedTicketNumber =
    normalizeValue(
      ticketNumber,
      "Ticket number",
    );

  const normalizedQrToken =
    normalizeValue(
      qrToken,
      "Ticket QR token",
      { uppercase: false },
    );

  return JSON.stringify({
    type: QR_TYPES.TICKET,

    ticketNumber:
      normalizedTicketNumber,

    token:
      normalizedQrToken,
  });
};

/**
 * ============================================================
 * Generate Certificate QR Payload
 * ============================================================
 *
 * Contains only:
 *
 * - Certificate number
 * - Verification code
 * ============================================================
 */

const generateCertificateQRPayload = ({
  certificateNumber,
  verificationCode,
}) => {
  const normalizedCertificateNumber =
    normalizeValue(
      certificateNumber,
      "Certificate number",
    );

  const normalizedVerificationCode =
    normalizeValue(
      verificationCode,
      "Certificate verification code",
    );

  return JSON.stringify({
    type: QR_TYPES.CERTIFICATE,

    certificateNumber:
      normalizedCertificateNumber,

    verificationCode:
      normalizedVerificationCode,
  });
};

/**
 * ============================================================
 * Generate QR Data URL
 * ============================================================
 *
 * Returns a Base64 data URL.
 *
 * Useful for:
 *
 * - API responses
 * - HTML
 * - Certificate previews
 * - Ticket previews
 * ============================================================
 */

const generateQRDataURL = async (
  data,
  options = {},
) => {
  if (
    data === undefined ||
    data === null ||
    data === ""
  ) {
    throw new Error(
      "QR code data is required.",
    );
  }

  return QRCode.toDataURL(
    String(data),
    {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 500,
      ...options,
    },
  );
};

/**
 * ============================================================
 * Generate QR Buffer
 * ============================================================
 *
 * Useful for:
 *
 * - Cloudinary uploads
 * - PDF generation
 * - Email attachments
 * - File generation
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
    throw new Error(
      "QR code data is required.",
    );
  }

  return QRCode.toBuffer(
    String(data),
    {
      type: "png",
      errorCorrectionLevel: "M",
      margin: 2,
      width: 500,
      ...options,
    },
  );
};

/**
 * ============================================================
 * Generate QR SVG
 * ============================================================
 */

const generateQRSVG = async (
  data,
  options = {},
) => {
  if (
    data === undefined ||
    data === null ||
    data === ""
  ) {
    throw new Error(
      "QR code data is required.",
    );
  }

  return QRCode.toString(
    String(data),
    {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 2,
      ...options,
    },
  );
};

/**
 * ============================================================
 * Generate QR File
 * ============================================================
 *
 * Generates a PNG file at the supplied path.
 * ============================================================
 */

const generateQRFile = async (
  data,
  filePath,
  options = {},
) => {
  if (
    data === undefined ||
    data === null ||
    data === ""
  ) {
    throw new Error(
      "QR code data is required.",
    );
  }

  if (
    typeof filePath !== "string" ||
    !filePath.trim()
  ) {
    throw new Error(
      "QR code file path is required.",
    );
  }

  await QRCode.toFile(
    filePath,
    String(data),
    {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 500,
      ...options,
    },
  );

  return filePath;
};

/**
 * ============================================================
 * Parse QR Payload
 * ============================================================
 *
 * Accepts either:
 *
 * - JSON string
 * - Already parsed object
 *
 * Only supported Scintillace QR types are accepted.
 * ============================================================
 */

const parseQRPayload = (
  payload,
) => {
  if (
    payload === undefined ||
    payload === null ||
    payload === ""
  ) {
    throw new Error(
      "QR payload is required.",
    );
  }

  let parsed;

  try {
    parsed =
      typeof payload === "string"
        ? JSON.parse(payload)
        : payload;
  } catch {
    throw new Error(
      "Invalid QR payload format.",
    );
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed)
  ) {
    throw new Error(
      "Invalid QR payload.",
    );
  }

  if (!parsed.type) {
    throw new Error(
      "QR payload type is missing.",
    );
  }

  /**
   * ----------------------------------------------------------
   * Ticket QR
   * ----------------------------------------------------------
   */

  if (
    parsed.type === QR_TYPES.TICKET
  ) {
    if (
      typeof parsed.ticketNumber !==
        "string" ||
      !parsed.ticketNumber.trim()
    ) {
      throw new Error(
        "Ticket number is missing from QR payload.",
      );
    }

    if (
      typeof parsed.token !==
        "string" ||
      !parsed.token.trim()
    ) {
      throw new Error(
        "Ticket verification token is missing from QR payload.",
      );
    }

    return {
      type: QR_TYPES.TICKET,

      ticketNumber:
        parsed.ticketNumber
          .trim()
          .toUpperCase(),

      token:
        parsed.token
          .trim(),
    };
  }

  /**
   * ----------------------------------------------------------
   * Certificate QR
   * ----------------------------------------------------------
   */

  if (
    parsed.type ===
    QR_TYPES.CERTIFICATE
  ) {
    if (
      typeof parsed.certificateNumber !==
        "string" ||
      !parsed.certificateNumber.trim()
    ) {
      throw new Error(
        "Certificate number is missing from QR payload.",
      );
    }

    if (
      typeof parsed.verificationCode !==
        "string" ||
      !parsed.verificationCode.trim()
    ) {
      throw new Error(
        "Certificate verification code is missing from QR payload.",
      );
    }

    return {
      type:
        QR_TYPES.CERTIFICATE,

      certificateNumber:
        parsed.certificateNumber
          .trim()
          .toUpperCase(),

      verificationCode:
        parsed.verificationCode
          .trim()
          .toUpperCase(),
    };
  }

  throw new Error(
    "Unsupported QR payload type.",
  );
};

/**
 * ============================================================
 * QR Utility Export
 * ============================================================
 */

const qrUtil = Object.freeze({
  QR_TYPES,

  generateTicketQRPayload,
  generateCertificateQRPayload,

  generateQRDataURL,
  generateQRBuffer,
  generateQRSVG,
  generateQRFile,

  parseQRPayload,
});

export default qrUtil;
