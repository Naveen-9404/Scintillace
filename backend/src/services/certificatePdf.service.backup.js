import fs from "fs/promises";
import path from "path";

import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import qrService from "./qr.service.js";

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 595;

const COLORS = Object.freeze({
  darkGreen: rgb(
    0.05,
    0.25,
    0.18,
  ),

  green: rgb(
    0.10,
    0.34,
    0.24,
  ),

  gold: rgb(
    0.72,
    0.52,
    0.16,
  ),

  darkText: rgb(
    0.12,
    0.14,
    0.13,
  ),

  lightText: rgb(
    0.30,
    0.32,
    0.30,
  ),

  cream: rgb(
    0.98,
    0.97,
    0.92,
  ),

  white: rgb(
    1,
    1,
    1,
  ),
});

const getTemplatePath = () => {
  return (
    process.env
      .CERTIFICATE_TEMPLATE_PATH ||
    path.resolve(
      process.cwd(),
      "assets",
      "certificate-template.png",
    )
  );
};

const safeText = (
  value,
  fallback = "",
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  return String(value).trim();
};

const formatDate = (
  value,
) => {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
};

const fitTextSize = ({
  text,
  font,
  maxWidth,
  initialSize = 24,
  minimumSize = 10,
}) => {
  let size =
    initialSize;

  while (
    size > minimumSize &&
    font.widthOfTextAtSize(
      text,
      size,
    ) > maxWidth
  ) {
    size -= 1;
  }

  return size;
};

const drawCenteredText = ({
  page,
  text,
  font,
  size,
  y,
  color,
}) => {
  const width =
    font.widthOfTextAtSize(
      text,
      size,
    );

  page.drawText(
    text,
    {
      x:
        (PAGE_WIDTH -
          width) /
        2,

      y,

      size,

      font,

      color,
    },
  );
};

const drawCenteredFittedText = ({
  page,
  text,
  font,
  maxWidth,
  initialSize,
  minimumSize,
  y,
  color,
}) => {
  const size =
    fitTextSize({
      text,
      font,
      maxWidth,
      initialSize,
      minimumSize,
    });

  drawCenteredText({
    page,
    text,
    font,
    size,
    y,
    color,
  });

  return size;
};

/**
 * ============================================================
 * Generate Certificate PDF
 * ============================================================
 */

const generateCertificatePdf =
  async (
    certificate,
  ) => {
    if (!certificate) {
      throw new Error(
        "Certificate data is required.",
      );
    }

    const pdfDoc =
      await PDFDocument.create();

    const page =
      pdfDoc.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
      ]);

    const regularFont =
      await pdfDoc.embedFont(
        StandardFonts.Helvetica,
      );

    const boldFont =
      await pdfDoc.embedFont(
        StandardFonts.HelveticaBold,
      );

    const italicFont =
      await pdfDoc.embedFont(
        StandardFonts.HelveticaOblique,
      );

    /**
     * ========================================================
     * Background Template
     * ========================================================
     */

    const templatePath =
      getTemplatePath();

    let templateLoaded =
      false;

    try {
      const templateBuffer =
        await fs.readFile(
          templatePath,
        );

      const lowerPath =
        templatePath.toLowerCase();

      let templateImage;

      if (
        lowerPath.endsWith(
          ".jpg",
        ) ||
        lowerPath.endsWith(
          ".jpeg",
        )
      ) {
        templateImage =
          await pdfDoc.embedJpg(
            templateBuffer,
          );
      } else {
        templateImage =
          await pdfDoc.embedPng(
            templateBuffer,
          );
      }

      page.drawImage(
        templateImage,
        {
          x: 0,
          y: 0,

          width:
            PAGE_WIDTH,

          height:
            PAGE_HEIGHT,
        },
      );

      templateLoaded =
        true;
    } catch {
      templateLoaded =
        false;
    }

    /**
     * ========================================================
     * Fallback Background
     * ========================================================
     */

    if (
      !templateLoaded
    ) {
      page.drawRectangle({
        x: 0,
        y: 0,

        width:
          PAGE_WIDTH,

        height:
          PAGE_HEIGHT,

        color:
          COLORS.cream,
      });

      page.drawRectangle({
        x: 14,
        y: 14,

        width:
          PAGE_WIDTH - 28,

        height:
          PAGE_HEIGHT - 28,

        borderColor:
          COLORS.darkGreen,

        borderWidth: 3,
      });

      page.drawRectangle({
        x: 21,
        y: 21,

        width:
          PAGE_WIDTH - 42,

        height:
          PAGE_HEIGHT - 42,

        borderColor:
          COLORS.gold,

        borderWidth: 1,
      });

      page.drawText(
        "JNTUA COLLEGE OF ENGINEERING (AUTONOMOUS) PULIVENDULA",
        {
          x: 125,
          y: 548,

          size: 14,

          font:
            boldFont,

          color:
            COLORS.darkGreen,
        },
      );

      drawCenteredText({
        page,

        text:
          "DEPARTMENT OF ELECTRONICS AND COMMUNICATION ENGINEERING",

        font:
          regularFont,

        size: 9,

        y: 532,

        color:
          COLORS.darkGreen,
      });
    }

    /**
     * ========================================================
     * Certificate Data
     * ========================================================
     *
     * participantName comes from the registration/certificate
     * snapshot rather than being taken directly from the
     * current user profile.
     */

    const participantName =
      safeText(
        certificate.participantName,
        safeText(
          certificate.user?.fullName,
          "Participant",
        ),
      );

    const eventTitle =
      safeText(
        certificate.event?.title,
        "Event",
      );

    const festivalTitle =
      safeText(
        certificate.festival?.title,
        "SCINTILLACE",
      );

    const certificateNumber =
      safeText(
        certificate.certificateNumber,
      );

    const certificateType =
      safeText(
        certificate.certificateType,
        "PARTICIPATION",
      );

    const issuedAt =
      formatDate(
        certificate.issuedAt,
      );

    /**
     * ========================================================
     * Main Text
     * ========================================================
     */

    if (
      !templateLoaded
    ) {
      drawCenteredText({
        page,

        text:
          "SCINTILLACE",

        font:
          boldFont,

        size: 42,

        y: 480,

        color:
          COLORS.darkGreen,
      });

      drawCenteredText({
        page,

        text:
          "ANNUAL TECHNO-CULTURAL FEST",

        font:
          boldFont,

        size: 11,

        y: 458,

        color:
          COLORS.gold,
      });

      drawCenteredText({
        page,

        text:
          "CERTIFICATE",

        font:
          boldFont,

        size: 30,

        y: 410,

        color:
          COLORS.darkGreen,
      });

      drawCenteredText({
        page,

        text:
          certificateType ===
          "PARTICIPATION"
            ? "OF PARTICIPATION"
            : certificateType.replace(
                "_",
                " ",
              ),

        font:
          boldFont,

        size: 11,

        y: 390,

        color:
          COLORS.gold,
      });
    }

    drawCenteredText({
      page,

      text:
        "This is to certify that",

      font:
        regularFont,

      size: 12,

      y: 325,

      color:
        COLORS.darkText,
    });

    drawCenteredFittedText({
      page,

      text:
        participantName,

      font:
        italicFont,

      maxWidth: 590,

      initialSize: 28,

      minimumSize: 16,

      y: 290,

      color:
        COLORS.darkGreen,
    });

    page.drawLine({
      start: {
        x: 175,
        y: 280,
      },

      end: {
        x: 667,
        y: 280,
      },

      thickness: 1,

      color:
        COLORS.gold,
    });

    const participationText =
      certificateType ===
      "PARTICIPATION"
        ? "has participated in"
        : certificateType ===
            "WINNER"
          ? "has secured the position of Winner in"
          : certificateType ===
              "RUNNER_UP"
            ? "has secured the position of Runner-Up in"
            : `has received a ${certificateType
                .replace(
                  "_",
                  " ",
                )
                .toLowerCase()} certificate for`;

    drawCenteredText({
      page,

      text:
        participationText,

      font:
        regularFont,

      size: 11,

      y: 255,

      color:
        COLORS.darkText,
    });

    drawCenteredFittedText({
      page,

      text:
        eventTitle.toUpperCase(),

      font:
        boldFont,

      maxWidth: 600,

      initialSize: 18,

      minimumSize: 10,

      y: 225,

      color:
        COLORS.darkGreen,
    });

    drawCenteredText({
      page,

      text:
        `organized as part of ${festivalTitle}`,

      font:
        regularFont,

      size: 10,

      y: 198,

      color:
        COLORS.darkText,
    });

    if (issuedAt) {
      drawCenteredText({
        page,

        text:
          `Certificate issued on ${issuedAt}`,

        font:
          regularFont,

        size: 9,

        y: 180,

        color:
          COLORS.lightText,
      });
    }

    drawCenteredText({
      page,

      text:
        "We appreciate your enthusiasm and commitment.",

      font:
        regularFont,

      size: 10,

      y: 155,

      color:
        COLORS.darkText,
    });

    /**
     * ========================================================
     * Certificate Number
     * ========================================================
     */

    page.drawText(
      "CERTIFICATE ID",
      {
        x: 55,
        y: 100,

        size: 8,

        font:
          boldFont,

        color:
          COLORS.darkGreen,
      },
    );

    page.drawText(
      certificateNumber,
      {
        x: 55,
        y: 84,

        size: 8,

        font:
          boldFont,

        color:
          COLORS.darkGreen,
      },
    );

    /**
     * ========================================================
     * QR Code
     * ========================================================
     */

    const {
      qrCode,
    } =
      await qrService.generateCertificateQR(
        {
          certificateNumber,

          verificationCode:
            certificate.verificationCode,
        },
      );

    const qrBase64 =
      qrCode.replace(
        /^data:image\/png;base64,/,
        "",
      );

    const qrBuffer =
      Buffer.from(
        qrBase64,
        "base64",
      );

    const qrImage =
      await pdfDoc.embedPng(
        qrBuffer,
      );

    page.drawRectangle({
      x: 50,
      y: 125,

      width: 90,
      height: 90,

      color:
        COLORS.white,

      borderColor:
        COLORS.gold,

      borderWidth: 1,
    });

    page.drawImage(
      qrImage,
      {
        x: 57,
        y: 132,

        width: 76,
        height: 76,
      },
    );

    /**
     * ========================================================
     * Verification Information
     * ========================================================
     */

    page.drawText(
      "Scan to verify certificate",
      {
        x: 50,
        y: 68,

        size: 7,

        font:
          regularFont,

        color:
          COLORS.lightText,
      },
    );

    /**
     * ========================================================
     * Output
     * ========================================================
     */

    const pdfBytes =
      await pdfDoc.save();

    return Buffer.from(
      pdfBytes,
    );
  };

const certificatePdfService =
  Object.freeze({
    generateCertificatePdf,
  });

export default certificatePdfService;