import fs from "fs/promises";
import path from "path";

import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import qrService from "./qr.service.js";

/**
 * ============================================================
 * SCINTILLACE CERTIFICATE PDF SERVICE
 * ============================================================
 *
 * Master template:
 *
 * backend/assets/certificate-template.jpg
 *
 * Template aspect ratio:
 * 1536 x 1024 = 3:2
 *
 * The PDF deliberately uses the same aspect ratio so that the
 * supplied certificate artwork is not distorted.
 * ============================================================
 */

const PAGE_WIDTH = 842;
const PAGE_HEIGHT = 842 * (2 / 3);

/**
 * Template coordinate system.
 *
 * The supplied artwork is 1536 x 1024.
 * All placement calculations are based on this coordinate
 * system and then scaled to the PDF page.
 */
const TEMPLATE_WIDTH = 1536;
const TEMPLATE_HEIGHT = 1024;

const SCALE_X =
  PAGE_WIDTH / TEMPLATE_WIDTH;

const SCALE_Y =
  PAGE_HEIGHT / TEMPLATE_HEIGHT;

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
    0.975,
    0.965,
    0.925,
  ),

  white: rgb(
    1,
    1,
    1,
  ),
});

/**
 * ============================================================
 * Template Path
 * ============================================================
 */

const getTemplatePath = () => {
  return (
    process.env.CERTIFICATE_TEMPLATE_PATH ||
    path.resolve(
      process.cwd(),
      "assets",
      "certificate-template.jpg",
    )
  );
};

/**
 * ============================================================
 * Utilities
 * ============================================================
 */

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

const formatFestivalDate = (
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

const ordinal = (
  number,
) => {
  const n =
    Number(number);

  if (
    n >= 11 &&
    n <= 13
  ) {
    return `${n}th`;
  }

  switch (
    n % 10
  ) {
    case 1:
      return `${n}st`;

    case 2:
      return `${n}nd`;

    case 3:
      return `${n}rd`;

    default:
      return `${n}th`;
  }
};

const formatCertificateDate = (
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

  return `${ordinal(
    date.getDate(),
  )} ${date.toLocaleDateString(
    "en-IN",
    {
      month: "long",
    },
  )} ${date.getFullYear()}`;
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
 * Convert template-space Y coordinate from the top
 * into PDF coordinate space from the bottom.
 */
const templateY = (
  topY,
) => {
  return (
    PAGE_HEIGHT -
    topY * SCALE_Y
  );
};

const templateX = (
  x,
) => {
  return x * SCALE_X;
};

const templateW = (
  width,
) => {
  return width * SCALE_X;
};

const templateH = (
  height,
) => {
  return height * SCALE_Y;
};

/**
 * ============================================================
 * Cover Dynamic Template Content
 * ============================================================
 *
 * The supplied artwork contains sample dynamic content:
 *
 * PAPER PRESENTATION
 * 29th September...
 * SC26-PP-000123
 * sample QR
 *
 * These areas are covered before drawing the real values.
 *
 * We intentionally keep the covering areas compact so the
 * surrounding watermark and artwork remain visible.
 * ============================================================
 */

const clearDynamicAreas = (
  page,
) => {
  /**
   * Participant name area
   */
  page.drawRectangle({
    x:
      templateX(330),

    y: templateY(645), width: templateW(875), height: templateH(35),

    color:
      COLORS.cream,
  });

  /**
   * Event name area.
   */
  page.drawRectangle({
    x:
      templateX(430),

    y:
      templateY(725),

    width:
      templateW(680),

    height:
      templateH(58),

    color:
      COLORS.cream,
  });

  /**
   * Festival/date area.
   */
  page.drawRectangle({
    x:
      templateX(400),

    y:
      templateY(785),

    width:
      templateW(740),

    height:
      templateH(70),

    color:
      COLORS.cream,
  });

  /**
   * Appreciation line.
   */
  page.drawRectangle({
    x:
      templateX(430),

    y:
      templateY(830),

    width:
      templateW(680),

    height:
      templateH(42),

    color:
      COLORS.cream,
  });

  /**
   * QR code area.
   */
  page.drawRectangle({
    x:
      templateX(55),

    y:
      templateY(900),

    width:
      templateW(155),

    height:
      templateH(130),

    color:
      COLORS.cream,
  });

  /**
   * Certificate ID area.
   */
  page.drawRectangle({
    x:
      templateX(45),

    y:
      templateY(955),

    width:
      templateW(220),

    height:
      templateH(65),

    color:
      COLORS.cream,
  });
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
    } catch (error) {
      console.error(
        "Certificate template could not be loaded:",
        error,
      );

      templateLoaded =
        false;
    }

    /**
     * ========================================================
     * Fallback
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
    }

    /**
     * ========================================================
     * Certificate Data
     * ========================================================
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
        "CERTIFICATE",
      );

    const certificateType =
      safeText(
        certificate.certificateType,
        "PARTICIPATION",
      );

    const festivalStartDate =
      certificate.festival?.startDate;

    const festivalEndDate =
      certificate.festival?.endDate;

    /**
     * ========================================================
     * Template Dynamic Area
     * ========================================================
     */

    if (
      templateLoaded
    ) {
      clearDynamicAreas(
        page,
      );
    }

    /**
     * ========================================================
     * Participant Name
     * ========================================================
     *
     * Template source position:
     *
     * approximately y = 650
     */

    drawCenteredFittedText({
      page,

      text:
        participantName,

      font:
        italicFont,

      maxWidth:
        templateW(850),

      initialSize:
        27,

      minimumSize:
        16,

      y:
        templateY(625),

      color:
        COLORS.darkGreen,
    });

    /**
     * ========================================================
     * Participant Underline
     * ========================================================
     */

    page.drawLine({
      start: {
        x:
          templateX(335),

        y:
          templateY(650),
      },

      end: {
        x:
          templateX(1205),

        y:
          templateY(650),
      },

      thickness:
        0.8,

      color:
        COLORS.gold,
    });

    /**
     * ========================================================
     * Participation Text
     * ========================================================
     */

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

    if (certificateType !== "PARTICIPATION") { drawCenteredText({ page, text: participationText, font: regularFont, size: 11, y: templateY(685), color: COLORS.darkText }); }

    /**
     * ========================================================
     * Event Title
     * ========================================================
     */

    drawCenteredFittedText({
      page,

      text:
        eventTitle.toUpperCase(),

      font:
        boldFont,

      maxWidth:
        templateW(730),

      initialSize:
        18,

      minimumSize:
        10,

      y:
        templateY(715),

      color:
        COLORS.darkGreen,
    });

    /**
     * ========================================================
     * Festival Title
     * ========================================================
     */

    drawCenteredText({
      page,

      text:
        `organized as part of ${festivalTitle}`,

      font:
        regularFont,

      size:
        10,

      y:
        templateY(742),

      color:
        COLORS.darkText,
    });

    /**
     * ========================================================
     * Festival Dates
     * ========================================================
     *
     * IMPORTANT:
     *
     * The certificate uses the festival dates, NOT the
     * certificate issue date.
     *
     * Scintillace 2K26:
     *
     * 29th September to 30th September 2026
     * ========================================================
     */

    let dateText = "";

    if (
      festivalStartDate &&
      festivalEndDate
    ) {
      dateText =
        `from ${formatCertificateDate(
          festivalStartDate,
        )} to ${formatCertificateDate(
          festivalEndDate,
        )}`;
    } else if (
      festivalStartDate
    ) {
      dateText =
        `on ${formatCertificateDate(
          festivalStartDate,
        )}`;
    }

    if (dateText) {
      drawCenteredFittedText({
        page,

        text:
          dateText,

        font:
          regularFont,

        maxWidth:
          templateW(750),

        initialSize:
          10,

        minimumSize:
          8,

        y:
          templateY(768),

        color:
          COLORS.darkText,
      });
    }

    /**
     * ========================================================
     * Appreciation
     * ========================================================
     */

    drawCenteredText({
      page,

      text:
        "We appreciate your enthusiasm and commitment.",

      font:
        regularFont,

      size:
        10,

      y:
        templateY(795),

      color:
        COLORS.darkText,
    });

    /**
     * ========================================================
     * QR CODE
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

    /**
     * QR white background
     */

    page.drawRectangle({
      x:
        templateX(65),

      y:
        templateY(885),

      width:
        templateW(125),

      height:
        templateH(125),

      color:
        COLORS.white,

      borderColor:
        COLORS.darkText,

      borderWidth:
        0.8,
    });

    page.drawImage(
      qrImage,
      {
        x:
          templateX(75),

        y:
          templateY(875),

        width:
          templateW(105),

        height:
          templateH(105),
      },
    );

    /**
     * ========================================================
     * Certificate ID
     * ========================================================
     */

    page.drawText(
      "CERTIFICATE ID",
      {
        x:
          templateX(75),

        y:
          templateY(918),

        size:
          8,

        font:
          regularFont,

        color:
          COLORS.darkText,
      },
    );

    const certificateIdSize =
      fitTextSize({
        text:
          certificateNumber,

        font:
          boldFont,

        maxWidth:
          templateW(220),

        initialSize:
          9,

        minimumSize:
          6,
      });

    page.drawText(
      certificateNumber,
      {
        x:
          templateX(75),

        y:
          templateY(943),

        size:
          certificateIdSize,

        font:
          boldFont,

        color:
          COLORS.darkText,
      },
    );

    /**
     * ========================================================
     * Verification Hint
     * ========================================================
     */

    page.drawText(
      "Scan to verify certificate",
      {
        x:
          templateX(75),

        y:
          templateY(965),

        size:
          7,

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






