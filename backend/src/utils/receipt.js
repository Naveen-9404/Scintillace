import PDFDocument from "pdfkit";

import qrUtil from "./qr.js";

/**
 * ============================================================
 * Helpers
 * ============================================================
 */

const formatDate = (
  value,
) => {
  if (!value) {
    return "N/A";
  }

  return new Date(
    value,
  ).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
};

const safeText = (
  value,
  fallback = "N/A",
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
};

const formatAmount = (
  amount,
  currency = "INR",
) => {
  const numericAmount =
    Number(amount || 0);

  if (
    currency === "INR"
  ) {
    return `₹${numericAmount.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
  }

  return `${currency} ${numericAmount.toFixed(
    2,
  )}`;
};

/**
 * ============================================================
 * Generate Registration Confirmation PDF
 * ============================================================
 */

const generateRegistrationPDF =
  async ({
    payment,
    registration,
    ticket,
  }) => {
    if (!payment) {
      throw new Error(
        "Payment is required to generate registration PDF.",
      );
    }

    if (!registration) {
      throw new Error(
        "Registration is required to generate registration PDF.",
      );
    }

    if (!ticket) {
      throw new Error(
        "Ticket is required to generate registration PDF.",
      );
    }

    if (!ticket.qrToken) {
      throw new Error(
        "Ticket QR token is required to generate registration PDF.",
      );
    }

    /**
     * ========================================================
     * QR
     * ========================================================
     */

    const qrPayload =
      qrUtil.generateTicketQRPayload({
        ticketNumber:
          ticket.ticketNumber,

        qrToken:
          ticket.qrToken,
      });

    const qrBuffer =
      await qrUtil.generateQRBuffer(
        qrPayload,
        {
          width: 500,
          margin: 2,
        },
      );

    /**
     * ========================================================
     * Related Data
     * ========================================================
     */

    const user =
      registration.user ||
      ticket.user ||
      {};

    const event =
      registration.event ||
      ticket.event ||
      {};

    const festival =
      registration.festival ||
      ticket.festival ||
      {};

    /**
     * ========================================================
     * PDF
     * ========================================================
     */

    return new Promise(
      (
        resolve,
        reject,
      ) => {
        const chunks = [];

        const document =
          new PDFDocument({
            size: "A4",
            margin: 45,

            info: {
              Title:
                "SCINTILLACE Event Registration Confirmation",

              Author:
                "SCINTILLACE",

              Subject:
                "Event Registration Confirmation",
            },
          });

        document.on(
          "data",
          (chunk) => {
            chunks.push(chunk);
          },
        );

        document.on(
          "end",
          () => {
            resolve(
              Buffer.concat(
                chunks,
              ),
            );
          },
        );

        document.on(
          "error",
          reject,
        );

        /**
         * ======================================================
         * Header
         * ======================================================
         */

        document
          .fontSize(26)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "SCINTILLACE",
            {
              align:
                "center",
            },
          );

        document
          .moveDown(0.3)
          .fontSize(11)
          .font(
            "Helvetica",
          )
          .fillColor(
            "#666666",
          )
          .text(
            "Event Registration Confirmation",
            {
              align:
                "center",
            },
          );

        document
          .moveDown(1)
          .fillColor(
            "#000000",
          );

        /**
         * ======================================================
         * Confirmation
         * ======================================================
         */

        document
          .fontSize(15)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "Registration Confirmed",
          );

        document
          .moveDown(0.5)
          .fontSize(10.5)
          .font(
            "Helvetica",
          )
          .text(
            `Dear ${safeText(
              user.fullName,
              "Participant",
            )},`,
          );

        document
          .moveDown(0.4)
          .text(
            "Your event registration and payment have been successfully completed. Please keep this document and present the QR code at the event entry.",
          );

        /**
         * ======================================================
         * Participant Details
         * ======================================================
         */

        document
          .moveDown(1)
          .fontSize(14)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "Participant Details",
          );

        document.moveDown(
          0.4,
        );

        const participantRows =
          [
            [
              "Name",
              safeText(
                user.fullName,
              ),
            ],

            [
              "Email",
              safeText(
                user.email,
              ),
            ],

            [
              "Phone",
              safeText(
                user.phone,
              ),
            ],

            [
              "College ID",
              safeText(
                user.collegeId,
              ),
            ],
          ];

        participantRows.forEach(
          ([label, value]) => {
            document
              .fontSize(10)
              .font(
                "Helvetica-Bold",
              )
              .text(
                `${label}: `,
                {
                  continued:
                    true,
                },
              )
              .font(
                "Helvetica",
              )
              .text(value);
          },
        );

        /**
         * ======================================================
         * Event Details
         * ======================================================
         */

        document
          .moveDown(1)
          .fontSize(14)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "Event Details",
          );

        document.moveDown(
          0.4,
        );

        const eventRows =
          [
            [
              "Festival",
              safeText(
                festival.title,
              ),
            ],

            [
              "Event",
              safeText(
                event.title,
              ),
            ],

            [
              "Category",
              safeText(
                event.category,
              ),
            ],

            [
              "Type",
              safeText(
                event.type,
              ),
            ],

            [
              "Venue",
              safeText(
                event.venue,
              ),
            ],

            [
              "Start",
              formatDate(
                event.startDateTime,
              ),
            ],

            [
              "End",
              formatDate(
                event.endDateTime,
              ),
            ],
          ];

        eventRows.forEach(
          ([label, value]) => {
            document
              .fontSize(10)
              .font(
                "Helvetica-Bold",
              )
              .text(
                `${label}: `,
                {
                  continued:
                    true,
                },
              )
              .font(
                "Helvetica",
              )
              .text(value);
          },
        );

        /**
         * ======================================================
         * Ticket Details
         * ======================================================
         */

        document
          .moveDown(1)
          .fontSize(14)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "Ticket Details",
          );

        document.moveDown(
          0.4,
        );

        const ticketRows =
          [
            [
              "Ticket Number",
              safeText(
                ticket.ticketNumber,
              ),
            ],

            [
              "Ticket Status",
              safeText(
                ticket.status,
              ),
            ],

            [
              "Registration Date",
              formatDate(
                registration.registrationDate ||
                  registration.createdAt,
              ),
            ],
          ];

        ticketRows.forEach(
          ([label, value]) => {
            document
              .fontSize(10)
              .font(
                "Helvetica-Bold",
              )
              .text(
                `${label}: `,
                {
                  continued:
                    true,
                },
              )
              .font(
                "Helvetica",
              )
              .text(value);
          },
        );

        /**
         * ======================================================
         * Payment Details
         * ======================================================
         */

        document
          .moveDown(1)
          .fontSize(14)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "Payment Details",
          );

        document.moveDown(
          0.4,
        );

        const paymentRows =
          [
            [
              "Amount Paid",
              formatAmount(
                payment.amount,
                payment.currency,
              ),
            ],

            [
              "Payment Method",
              "UPI",
            ],

            [
              "Payment Status",
              "VERIFIED",
            ],

            [
              "Verified At",
              formatDate(
                payment.paidAt || new Date(),
              ),
            ],
          ];

        paymentRows.forEach(
          ([label, value]) => {
            document
              .fontSize(10)
              .font(
                "Helvetica-Bold",
              )
              .text(
                `${label}: `,
                {
                  continued:
                    true,
                },
              )
              .font(
                "Helvetica",
              )
              .text(value);
          },
        );

        /**
         * ======================================================
         * QR
         * ======================================================
         */

        document
          .moveDown(1)
          .fontSize(14)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "Entry QR Code",
            {
              align:
                "center",
            },
          );

        document.moveDown(
          0.4,
        );

        const qrSize = 180;

        const qrX =
          (
            document.page.width -
            qrSize
          ) / 2;

        document.image(
          qrBuffer,
          qrX,
          document.y,
          {
            width:
              qrSize,

            height:
              qrSize,
          },
        );

        document.y +=
          qrSize + 10;

        document
          .fontSize(9)
          .font(
            "Helvetica",
          )
          .fillColor(
            "#666666",
          )
          .text(
            "Please present this QR code at the event entry for verification.",
            {
              align:
                "center",
            },
          );

        /**
         * ======================================================
         * Footer
         * ======================================================
         */

        document
          .moveDown(1)
          .fillColor(
            "#000000",
          )
          .fontSize(8)
          .text(
            "This document is system generated and does not require a physical signature.",
            {
              align:
                "center",
            },
          );

        document.end();
      },
    );
  };

/**
 * ============================================================
 * Generate Accommodation Receipt PDF
 * ============================================================
 *
 * The participant selects only:
 *
 * - Boys Hostel
 * - Girls Hostel
 *
 * Actual room / bed allocation is handled offline
 * by the SCINTILLACE accommodation team.
 *
 * Pricing:
 *
 * ₹100 per accommodation day.
 */

const generateAccommodationReceiptPDF =
  async ({
    accommodation,
  }) => {
    if (!accommodation) {
      throw new Error(
        "Accommodation booking is required to generate accommodation receipt.",
      );
    }

    if (
      accommodation.paymentStatus !==
      "Paid"
    ) {
      throw new Error(
        "Accommodation payment must be completed before generating the receipt.",
      );
    }

    const user =
      accommodation.user ||
      {};

    const registration =
      accommodation.registration ||
      {};

    const event =
      accommodation.event ||
      registration.event ||
      {};

    const festival =
      event.festival ||
      registration.festival ||
      {};

    /**
     * ========================================================
     * Optional QR
     * ========================================================
     *
     * The QR is only included when a confirmation code
     * exists. The receipt itself does not depend on QR
     * generation.
     */

    let qrBuffer = null;

    if (
      accommodation.confirmationCode
    ) {
      const qrPayload =
        `SCINTILLACE-ACCOMMODATION:${accommodation.confirmationCode}`;

      qrBuffer =
        await qrUtil.generateQRBuffer(
          qrPayload,
          {
            width: 350,
            margin: 2,
          },
        );
    }

    /**
     * ========================================================
     * PDF
     * ========================================================
     */

    return new Promise(
      (
        resolve,
        reject,
      ) => {
        const chunks = [];

        const document =
          new PDFDocument({
            size: "A4",
            margin: 45,

            info: {
              Title:
                "SCINTILLACE Accommodation Payment Receipt",

              Author:
                "SCINTILLACE",

              Subject:
                "Accommodation Payment Receipt",
            },
          });

        document.on(
          "data",
          (chunk) => {
            chunks.push(chunk);
          },
        );

        document.on(
          "end",
          () => {
            resolve(
              Buffer.concat(
                chunks,
              ),
            );
          },
        );

        document.on(
          "error",
          reject,
        );

        /**
         * ======================================================
         * Header
         * ======================================================
         */

        document
          .fontSize(26)
          .font(
            "Helvetica-Bold",
          )
          .fillColor(
            "#000000",
          )
          .text(
            "SCINTILLACE",
            {
              align:
                "center",
            },
          );

        document
          .moveDown(0.3)
          .fontSize(11)
          .font(
            "Helvetica",
          )
          .fillColor(
            "#666666",
          )
          .text(
            "Accommodation Payment Receipt",
            {
              align:
                "center",
            },
          );

        document
          .moveDown(1)
          .fillColor(
            "#000000",
          );

        /**
         * ======================================================
         * Payment Confirmation
         * ======================================================
         */

        document
          .fontSize(16)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "Payment Successful",
            {
              align:
                "center",
            },
          );

        document
          .moveDown(0.5)
          .fontSize(10.5)
          .font(
            "Helvetica",
          )
          .text(
            `Dear ${safeText(
              user.fullName,
              "Participant",
            )},`,
          );

        document
          .moveDown(0.4)
          .text(
            "Your accommodation payment for SCINTILLACE has been successfully received. Please keep this receipt for your records.",
          );

        /**
         * ======================================================
         * Participant Details
         * ======================================================
         */

        document
          .moveDown(1)
          .fontSize(14)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "Participant Details",
          );

        document.moveDown(
          0.4,
        );

        const participantRows =
          [
            [
              "Name",
              safeText(
                user.fullName,
              ),
            ],

            [
              "Email",
              safeText(
                user.email,
              ),
            ],

            [
              "Phone",
              safeText(
                user.phone,
              ),
            ],

            [
              "College ID",
              safeText(
                user.collegeId,
              ),
            ],
          ];

        participantRows.forEach(
          ([label, value]) => {
            document
              .fontSize(10)
              .font(
                "Helvetica-Bold",
              )
              .text(
                `${label}: `,
                {
                  continued:
                    true,
                },
              )
              .font(
                "Helvetica",
              )
              .text(value);
          },
        );

        /**
         * ======================================================
         * Festival / Event Details
         * ======================================================
         */

        document
          .moveDown(1)
          .fontSize(14)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "Registration Details",
          );

        document.moveDown(
          0.4,
        );

        const registrationRows =
          [
            [
              "Festival",
              safeText(
                festival.title,
                "SCINTILLACE 2K26",
              ),
            ],

            [
              "Event",
              safeText(
                event.title,
              ),
            ],

            [
              "Registration ID",
              safeText(
                registration._id ||
                  registration.id,
              ),
            ],
          ];

        registrationRows.forEach(
          ([label, value]) => {
            document
              .fontSize(10)
              .font(
                "Helvetica-Bold",
              )
              .text(
                `${label}: `,
                {
                  continued:
                    true,
                },
              )
              .font(
                "Helvetica",
              )
              .text(value);
          },
        );

        /**
         * ======================================================
         * Accommodation Details
         * ======================================================
         */

        document
          .moveDown(1)
          .fontSize(14)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "Accommodation Details",
          );

        document.moveDown(
          0.4,
        );

        const accommodationRows =
          [
            [
              "Hostel",
              accommodation.hostelType ===
              "BOYS"
                ? "Boys Hostel"
                : accommodation.hostelType ===
                    "GIRLS"
                  ? "Girls Hostel"
                  : safeText(
                      accommodation.hostelType,
                    ),
            ],

            [
              "Check-in",
              formatDate(
                accommodation.checkInDate,
              ),
            ],

            [
              "Check-out",
              formatDate(
                accommodation.checkOutDate,
              ),
            ],

            [
              "Accommodation Days",
              safeText(
                accommodation.accommodationDays,
                "0",
              ),
            ],

            [
              "Rate",
              `${formatAmount(
                100,
                "INR",
              )} per day`,
            ],
          ];

        accommodationRows.forEach(
          ([label, value]) => {
            document
              .fontSize(10)
              .font(
                "Helvetica-Bold",
              )
              .text(
                `${label}: `,
                {
                  continued:
                    true,
                },
              )
              .font(
                "Helvetica",
              )
              .text(value);
          },
        );

        /**
         * ======================================================
         * Important Allocation Note
         * ======================================================
         */

        document
          .moveDown(0.8)
          .fontSize(9)
          .fillColor(
            "#555555",
          )
          .text(
            "Note: Room and bed allotment is handled offline by the SCINTILLACE accommodation team. This receipt confirms your accommodation booking and selected hostel preference only.",
          );

        document.fillColor(
          "#000000",
        );

        /**
         * ======================================================
         * Payment Details
         * ======================================================
         */

        document
          .moveDown(1)
          .fontSize(14)
          .font(
            "Helvetica-Bold",
          )
          .text(
            "Payment Details",
          );

        document.moveDown(
          0.4,
        );

        const paymentRows =
          [
            [
              "Amount Paid",
              formatAmount(
                accommodation.amount,
                accommodation.currency,
              ),
            ],

            [
              "Payment Method",
              "UPI",
            ],

            [
              "Payment Status",
              "VERIFIED",
            ],

            [
              "Verified At",
              formatDate(
                accommodation.paidAt ||
                  accommodation.payment?.paidAt ||
                  new Date(),
              ),
            ],
          ];

        paymentRows.forEach(
          ([label, value]) => {
            document
              .fontSize(10)
              .font(
                "Helvetica-Bold",
              )
              .text(
                `${label}: `,
                {
                  continued:
                    true,
                },
              )
              .font(
                "Helvetica",
              )
              .text(value);
          },
        );

        /**
         * ======================================================
         * Confirmation Code
         * ======================================================
         */

        if (
          accommodation.confirmationCode
        ) {
          document
            .moveDown(0.8)
            .fontSize(11)
            .font(
              "Helvetica-Bold",
            )
            .text(
              `Accommodation Confirmation Code: ${accommodation.confirmationCode}`,
              {
                align:
                  "center",
              },
            );
        }

        /**
         * ======================================================
         * Optional QR
         * ======================================================
         */

        if (qrBuffer) {
          document
            .moveDown(0.8)
            .fontSize(12)
            .font(
              "Helvetica-Bold",
            )
            .text(
              "Accommodation Verification QR",
              {
                align:
                  "center",
              },
            );

          document.moveDown(
            0.3,
          );

          const qrSize = 120;

          const qrX =
            (
              document.page.width -
              qrSize
            ) / 2;

          document.image(
            qrBuffer,
            qrX,
            document.y,
            {
              width:
                qrSize,

              height:
                qrSize,
            },
          );

          document.y +=
            qrSize + 10;
        }

        /**
         * ======================================================
         * Footer
         * ======================================================
         */

        document
          .moveDown(1)
          .fontSize(8)
          .font(
            "Helvetica",
          )
          .fillColor(
            "#666666",
          )
          .text(
            "This receipt is system generated and does not require a physical signature.",
            {
              align:
                "center",
            },
          );

        document
          .moveDown(0.3)
          .text(
            "SCINTILLACE Team",
            {
              align:
                "center",
            },
          );

        document.end();
      },
    );
  };

/**
 * ============================================================
 * Existing Payment Receipt
 * ============================================================
 *
 * Kept for compatibility with the existing payment receipt
 * endpoint.
 */

const generateReceiptPDF =
  (payment) => {
    return Buffer.from(
      [
        "SCINTILLACE",
        "",
        "Payment Receipt",
        "",
        `Order ID: ${
          payment?.orderId ||
          "N/A"
        }`,
        `Payment ID: ${
          payment?.paymentId ||
          "N/A"
        }`,
        `Amount: ${
          payment?.amount ||
          0
        } ${
          payment?.currency ||
          "INR"
        }`,
        `Status: ${
          payment?.status ||
          "N/A"
        }`,
        `Paid At: ${
          formatDate(
            payment?.paidAt,
          )
        }`,
      ].join("\n"),
    );
  };

const receiptUtil =
  Object.freeze({
    generateReceiptPDF,

    generateRegistrationPDF,

    generateAccommodationReceiptPDF,
  });

export default receiptUtil;