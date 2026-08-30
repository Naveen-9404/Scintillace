import nodemailer from "nodemailer";

/**
 * ============================================================
 * SMTP Transport
 * ============================================================
 */

const transporter =
  nodemailer.createTransport({
    host:
      process.env.SMTP_HOST,

    port:
      Number(
        process.env.SMTP_PORT || 587,
      ),

    secure:
      String(
        process.env.SMTP_SECURE,
      ).toLowerCase() === "true",

    auth: {
      user:
        process.env.SMTP_USER,

      pass:
        process.env.SMTP_PASSWORD,
    },
  });

/**
 * ============================================================
 * Sender
 * ============================================================
 */

const getSender = () => {
  const fromName =
    process.env.SMTP_FROM_NAME ||
    "SCINTILLACE";

  const fromEmail =
    process.env.SMTP_FROM_EMAIL ||
    process.env.SMTP_USER;

  return `"${fromName}" <${fromEmail}>`;
};

/**
 * ============================================================
 * Registration Confirmation
 * ============================================================
 */

const sendRegistrationConfirmation =
  async ({
    to,
    participantName,
    eventName,
    ticketNumber,
    pdfBuffer,
  }) => {
    if (!to) {
      throw new Error(
        "Recipient email is required.",
      );
    }

    if (!pdfBuffer) {
      throw new Error(
        "Registration PDF is required.",
      );
    }

    return transporter.sendMail({
      from: getSender(),

      to,

      subject:
        `SCINTILLACE Registration Confirmed - ${
          eventName || "Event"
        }`,

      text:
        `Dear ${
          participantName ||
          "Participant"
        },

Your registration for ${
          eventName ||
          "the event"
        } has been successfully confirmed.

Ticket Number: ${
          ticketNumber || "N/A"
        }

Your registration confirmation PDF containing your event details, payment information and QR code is attached.

Please keep the QR code available when you arrive at the event.

Regards,
SCINTILLACE Team`,

      html: `
        <div style="
          font-family:Arial,sans-serif;
          line-height:1.6;
          color:#222;
          max-width:650px;
          margin:auto;
        ">

          <h2>
            SCINTILLACE
          </h2>

          <h3>
            Registration Confirmed
          </h3>

          <p>
            Dear ${
              participantName ||
              "Participant"
            },
          </p>

          <p>
            Your registration for
            <strong>
              ${
                eventName ||
                "the event"
              }
            </strong>
            has been successfully confirmed.
          </p>

          <p>
            <strong>
              Ticket Number:
            </strong>
            ${
              ticketNumber ||
              "N/A"
            }
          </p>

          <p>
            Your registration confirmation PDF
            containing your event details,
            payment information and entry QR code
            is attached to this email.
          </p>

          <p>
            Please keep the QR code available when
            you arrive at the event.
          </p>

          <p>
            Regards,<br/>
            <strong>
              SCINTILLACE Team
            </strong>
          </p>

        </div>
      `,

      attachments: [
        {
          filename:
            `SCINTILLACE-${
              ticketNumber ||
              "Registration"
            }.pdf`,

          content:
            pdfBuffer,

          contentType:
            "application/pdf",
        },
      ],
    });
  };

/**
 * ============================================================
 * Accommodation Confirmation / Receipt
 * ============================================================
 *
 * Sent after successful accommodation payment.
 *
 * The email is sent to the participant's registered
 * email address.
 *
 * The attached PDF contains:
 *
 * - Participant details
 * - Festival / event details
 * - Hostel preference
 * - Check-in / check-out
 * - Accommodation days
 * - ₹200/day pricing
 * - Total amount
 * - Payment information
 * - Confirmation code, when available
 *
 * Room / bed allocation is NOT included because it is
 * handled offline by the accommodation team.
 */

const sendAccommodationConfirmation =
  async ({
    to,
    participantName,
    eventName,
    hostelType,
    checkInDate,
    checkOutDate,
    accommodationDays,
    amount,
    currency = "INR",
    paymentId,
    orderId,
    accommodationId,
    confirmationCode,
    pdfBuffer,
  }) => {
    if (!to) {
      throw new Error(
        "Recipient email is required.",
      );
    }

    if (!pdfBuffer) {
      throw new Error(
        "Accommodation receipt PDF is required.",
      );
    }

    const hostelName =
      hostelType === "BOYS"
        ? "Boys Hostel"
        : hostelType === "GIRLS"
          ? "Girls Hostel"
          : hostelType ||
            "Hostel";

    return transporter.sendMail({
      from: getSender(),

      to,

      subject:
        `SCINTILLACE Accommodation Payment Confirmed - ${
          eventName ||
          "Event"
        }`,

      text:
        `Dear ${
          participantName ||
          "Participant"
        },

Your accommodation payment for ${
          eventName ||
          "SCINTILLACE"
        } has been successfully received.

Accommodation Details
---------------------
Hostel: ${hostelName}
Check-in: ${
          checkInDate ||
          "N/A"
        }
Check-out: ${
          checkOutDate ||
          "N/A"
        }
Accommodation Days: ${
          accommodationDays ||
          0
        }

Amount Paid: ${
          currency
        } ${
          amount ||
          0
        }

Payment Method: UPI

Payment Status: VERIFIED

Accommodation Booking ID: ${
          accommodationId ||
          "N/A"
        }

Confirmation Code: ${
          confirmationCode ||
          "Pending administrative confirmation"
        }

Your accommodation payment receipt is attached to this email as a PDF.

Please note that room and bed allotment will be handled offline by the SCINTILLACE accommodation team.

Please retain this email and the attached receipt for future reference.

Regards,
SCINTILLACE Team`,

      html: `
        <div style="
          font-family:Arial,sans-serif;
          line-height:1.7;
          color:#222;
          max-width:650px;
          margin:auto;
        ">

          <h2>
            SCINTILLACE
          </h2>

          <h3>
            Accommodation Payment Confirmed
          </h3>

          <p>
            Dear ${
              participantName ||
              "Participant"
            },
          </p>

          <p>
            Your accommodation payment for
            <strong>
              ${
                eventName ||
                "SCINTILLACE"
              }
            </strong>
            has been successfully received.
          </p>

          <div style="
            background:#f5f5f5;
            border-left:4px solid #b8860b;
            padding:14px 18px;
            margin:20px 0;
          ">

            <h4 style="
              margin-top:0;
            ">
              Accommodation Details
            </h4>

            <p>
              <strong>
                Hostel:
              </strong>
              ${hostelName}
            </p>

            <p>
              <strong>
                Check-in:
              </strong>
              ${
                checkInDate ||
                "N/A"
              }
            </p>

            <p>
              <strong>
                Check-out:
              </strong>
              ${
                checkOutDate ||
                "N/A"
              }
            </p>

            <p>
              <strong>
                Accommodation Days:
              </strong>
              ${
                accommodationDays ||
                0
              }
            </p>

            <p>
              <strong>
                Amount Paid:
              </strong>
              ${
                currency
              } ${
                amount ||
                0
              }
            </p>

          </div>

          <div style="
            background:#f9fafb;
            border:1px solid #ddd;
            padding:14px 18px;
            margin:20px 0;
          ">

            <h4 style="
              margin-top:0;
            ">
              Payment Details
            </h4>

            <p>
              <strong>
                Payment Method:
              </strong>
              UPI
            </p>

            <p>
              <strong>
                Payment Status:
              </strong>
              VERIFIED
            </p>

            <p>
              <strong>
                Accommodation Booking ID:
              </strong>
              ${
                accommodationId ||
                "N/A"
              }
            </p>

            <p>
              <strong>
                Confirmation Code:
              </strong>
              ${
                confirmationCode ||
                "Pending administrative confirmation"
              }
            </p>

          </div>

          <p>
            Your accommodation payment receipt is
            attached to this email as a PDF.
          </p>

          <p style="
            background:#fff7ed;
            border-left:4px solid #d97706;
            padding:12px 15px;
          ">
            <strong>
              Important:
            </strong>
            Room and bed allotment will be handled
            offline by the SCINTILLACE accommodation
            team.
          </p>

          <p>
            Please retain this email and the attached
            receipt for future reference.
          </p>

          <p>
            Regards,<br/>
            <strong>
              SCINTILLACE Team
            </strong>
          </p>

        </div>
      `,

      attachments: [
        {
          filename:
            `SCINTILLACE-Accommodation-${
              accommodationId ||
              "Receipt"
            }.pdf`,

          content:
            pdfBuffer,

          contentType:
            "application/pdf",
        },
      ],
    });
  };

/**
 * ============================================================
 * Certificate Email
 * ============================================================
 */

const sendCertificateEmail =
  async ({
    to,
    participantName,
    eventName,
    festivalName,
    certificateNumber,
    certificateType,
    pdfBuffer,
  }) => {
    if (!to) {
      throw new Error(
        "Recipient email is required.",
      );
    }

    if (!pdfBuffer) {
      throw new Error(
        "Certificate PDF is required.",
      );
    }

    const displayType =
      certificateType ===
      "PARTICIPATION"
        ? "Certificate of Participation"
        : `${String(
            certificateType ||
              "CERTIFICATE",
          )
            .replace(
              "_",
              " ",
            )
            .toLowerCase()
            .replace(
              /\b\w/g,
              (letter) =>
                letter.toUpperCase(),
            )} Certificate`;

    return transporter.sendMail({
      from: getSender(),

      to,

      subject:
        `SCINTILLACE Certificate - ${
          eventName ||
          "Event"
        }`,

      text:
        `Dear ${
          participantName ||
          "Participant"
        },

Congratulations!

Your ${displayType} for ${
          eventName ||
          "the event"
        } at ${
          festivalName ||
          "SCINTILLACE"
        } has been issued.

Certificate ID: ${
          certificateNumber
        }

Your official certificate is attached to this email as a PDF.

The certificate contains a unique QR code which can be scanned to verify the certificate and view the participation details.

Please keep this certificate safely.

Regards,
SCINTILLACE Team`,

      html: `
        <div style="
          font-family:Arial,sans-serif;
          line-height:1.7;
          color:#222;
          max-width:650px;
          margin:auto;
        ">

          <h2 style="color:#14532d;">
            SCINTILLACE
          </h2>

          <h3>
            Certificate Issued
          </h3>

          <p>
            Dear ${
              participantName ||
              "Participant"
            },
          </p>

          <p>
            Congratulations!
          </p>

          <p>
            Your
            <strong>
              ${displayType}
            </strong>
            for
            <strong>
              ${
                eventName ||
                "the event"
              }
            </strong>
            at
            <strong>
              ${
                festivalName ||
                "SCINTILLACE"
              }
            </strong>
            has been officially issued.
          </p>

          <div style="
            background:#f5f5f5;
            border-left:4px solid #b8860b;
            padding:12px 16px;
            margin:20px 0;
          ">

            <strong>
              Certificate ID:
            </strong>

            ${
              certificateNumber
            }

          </div>

          <p>
            Your official certificate is attached
            to this email as a PDF.
          </p>

          <p>
            The certificate contains a unique QR code.
            Scanning the QR code allows anyone to verify
            the certificate and view the corresponding
            participation details.
          </p>

          <p>
            Please keep your certificate safely for
            future reference.
          </p>

          <p>
            Regards,<br/>
            <strong>
              SCINTILLACE Team
            </strong>
          </p>

        </div>
      `,

      attachments: [
        {
          filename:
            `SCINTILLACE-CERT-${certificateNumber}.pdf`,

          content:
            pdfBuffer,

          contentType:
            "application/pdf",
        },
      ],
    });
  };

/**
 * ============================================================
 * Verify SMTP
 * ============================================================
 */

const verifyEmailTransport =
  async () => {
    return transporter.verify();
  };

/**
 * ============================================================
 * Email Utility Export
 * ============================================================
 */

const emailUtil =
  Object.freeze({
    sendRegistrationConfirmation,

    sendAccommodationConfirmation,

    sendCertificateEmail,

    verifyEmailTransport,
  });

export default emailUtil;