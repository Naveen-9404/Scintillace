import crypto from "crypto";
import mongoose from "mongoose";

import certificateRepository from "../repositories/certificate.repository.js";
import registrationRepository from "../repositories/registration.repository.js";

import qrService from "./qr.service.js";
import certificatePdfService from "./certificatePdf.service.js";

import emailUtil from "../utils/email.js";
import ApiError from "../utils/ApiError.js";

import HTTP_STATUS from "../constants/httpStatus.js";
import ROLES from "../constants/roles.js";

/**
 * ============================================================
 * Validation Helpers
 * ============================================================
 */

const validateObjectId = (
  value,
  label,
) => {
  if (
    !mongoose.Types.ObjectId.isValid(
      value,
    )
  ) {
    throw new ApiError(
      `Invalid ${label}.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

/**
 * ============================================================
 * Pagination Helpers
 * ============================================================
 */

const normalizePagination = ({
  page = 1,
  limit = 10,
} = {}) => ({
  page: Math.max(
    1,
    Number(page) || 1,
  ),

  limit: Math.min(
    100,
    Math.max(
      1,
      Number(limit) || 10,
    ),
  ),
});

const buildPagination = ({
  page,
  limit,
  total,
}) => ({
  page,
  limit,
  total,
  totalPages:
    total === 0
      ? 0
      : Math.ceil(
          total / limit,
        ),
});

/**
 * ============================================================
 * Certificate Number
 * ============================================================
 */

const generateCertificateNumber =
  () => {
    const timestamp =
      Date.now()
        .toString(36)
        .toUpperCase();

    const random =
      crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `SCINTILLACE-CERT-${timestamp}-${random}`;
  };

/**
 * ============================================================
 * Verification Code
 * ============================================================
 */

const generateVerificationCode =
  () => {
    return qrService.generateCertificateVerificationCode();
  };

/**
 * ============================================================
 * Authorization
 * ============================================================
 */

const ensureAdminOrFaculty = (
  user,
) => {
  if (!user) {
    throw new ApiError(
      "Authentication required.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  if (
    user.role !==
      ROLES.SUPER_ADMIN &&
    user.role !==
      ROLES.FACULTY
  ) {
    throw new ApiError(
      "You are not authorized to manage certificates.",
      HTTP_STATUS.FORBIDDEN,
    );
  }
};

const isCertificateOwnerOrAdmin = (
  certificate,
  requesterId,
  requesterRole,
) => {
  const certificateUserId =
    certificate.user?._id ||
    certificate.user;

  return (
    certificateUserId?.toString() ===
      requesterId.toString() ||
    requesterRole ===
      ROLES.SUPER_ADMIN ||
    requesterRole ===
      ROLES.FACULTY
  );
};

/**
 * ============================================================
 * Create Certificate
 * ============================================================
 */

const createCertificate =
  async (
    certificateData,
    issuedBy,
  ) => {
    const {
      user,
      registration,
      event,
      festival,
      teamMemberId,
    } = certificateData;

    if (user) {
      validateObjectId(
        user,
        "User ID",
      );
    }

    if (teamMemberId) {
      validateObjectId(
        teamMemberId,
        "Team Member ID",
      );
    }

    validateObjectId(
      registration,
      "Registration ID",
    );

    validateObjectId(
      event,
      "Event ID",
    );

    validateObjectId(
      festival,
      "Festival ID",
    );

    validateObjectId(
      issuedBy,
      "Issued By User ID",
    );

    const registrationRecord =
      await registrationRepository.findById(
        registration,
      );

    if (!registrationRecord) {
      throw new ApiError(
        "Registration not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      !registrationRecord.checkedIn
    ) {
      throw new ApiError(
        "Certificate cannot be created because the participant has not checked in.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      registrationRecord.status ===
      "CANCELLED"
    ) {
      throw new ApiError(
        "Cancelled registrations are not eligible for certificates.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const existing =
      await certificateRepository.registrationMemberCertificateExists(
        registration,
        teamMemberId,
      );

    if (existing) {
      throw new ApiError(
        "A certificate already exists for this registration member.",
        HTTP_STATUS.CONFLICT,
      );
    }

    let participantName = "";
    let participantEmail = "";

    if (teamMemberId) {
      const member = registrationRecord.team?.members?.find(
        (m) => m._id.toString() === teamMemberId.toString()
      );
      if (member) {
        participantName = member.participantName || member.user?.fullName || "";
        participantEmail = member.participantEmail || member.user?.email || "";
      }
    }

    if (!participantName) {
      participantName =
        (
          registrationRecord
            .participantName ||
          registrationRecord
            .user?.fullName ||
          ""
        ).trim();
    }

    if (!participantEmail) {
      participantEmail =
        (
          registrationRecord
            .participantEmail ||
          registrationRecord
            .user?.email ||
          ""
        ).trim();
    }

    if (!participantName) {
      throw new ApiError(
        "Participant name is missing.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const certificateNumber =
      generateCertificateNumber();

    const verificationCode =
      generateVerificationCode();

    return certificateRepository.create({
      ...certificateData,

      participantName,

      email:
        participantEmail,

      certificateNumber,

      verificationCode,

      issuedBy,

      status: "GENERATED",

      issuedAt: null,

      emailSent: false,

      emailSentAt: null,

      emailError: "",
    });
  };

/**
 * ============================================================
 * Get Certificate By ID
 * ============================================================
 */

const getCertificateById =
  async (
    certificateId,
  ) => {
    validateObjectId(
      certificateId,
      "Certificate ID",
    );

    const certificate =
      await certificateRepository.findById(
        certificateId,
      );

    if (!certificate) {
      throw new ApiError(
        "Certificate not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return certificate;
  };

/**
 * ============================================================
 * Get Certificate QR
 * ============================================================
 */

const getCertificateQR =
  async (
    certificateId,
    requesterId,
    requesterRole,
  ) => {
    const certificate =
      await getCertificateById(
        certificateId,
      );

    if (
      !isCertificateOwnerOrAdmin(
        certificate,
        requesterId,
        requesterRole,
      )
    ) {
      throw new ApiError(
        "You are not authorized to access this certificate QR code.",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const certificateWithVerificationCode =
      await certificateRepository.findByCertificateNumberWithVerificationCode(
        certificate.certificateNumber,
      );

    if (
      !certificateWithVerificationCode
    ) {
      throw new ApiError(
        "Certificate not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    const {
      qrCode,
    } =
      await qrService.generateCertificateQR(
        certificateWithVerificationCode,
      );

    return {
      certificateNumber:
        certificateWithVerificationCode.certificateNumber,

      qrCode,
    };
  };

/**
 * ============================================================
 * Verify Certificate
 * ============================================================
 */

const verifyCertificate =
  async (
    verificationCode,
  ) => {
    if (
      typeof verificationCode !==
        "string" ||
      !verificationCode.trim()
    ) {
      throw new ApiError(
        "Verification code is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const certificate =
      await certificateRepository.findByVerificationCode(
        verificationCode
          .trim()
          .toUpperCase(),
      );

    if (!certificate) {
      throw new ApiError(
        "Certificate not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      certificate.status ===
      "REVOKED"
    ) {
      throw new ApiError(
        "This certificate has been revoked.",
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
 * Get Certificate By Number
 * ============================================================
 */

const getCertificateByNumber =
  async (
    certificateNumber,
  ) => {
    if (
      typeof certificateNumber !==
        "string" ||
      !certificateNumber.trim()
    ) {
      throw new ApiError(
        "Certificate number is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const certificate =
      await certificateRepository.findByCertificateNumber(
        certificateNumber
          .trim()
          .toUpperCase(),
      );

    if (!certificate) {
      throw new ApiError(
        "Certificate not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    return certificate;
  };

/**
 * ============================================================
 * Get My Certificates
 * ============================================================
 */

const getMyCertificates =
  async (
    userId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    validateObjectId(
      userId,
      "User ID",
    );

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const [
      certificates,
      total,
    ] = await Promise.all([
      certificateRepository.getByUser(
        userId,
        pagination,
      ),

      certificateRepository.countByUser(
        userId,
      ),
    ]);

    return {
      certificates,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Get All Certificates
 * ============================================================
 */

const getAllCertificates =
  async ({
    filter = {},
    page = 1,
    limit = 10,
  } = {}) => {
    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const [
      certificates,
      total,
    ] = await Promise.all([
      certificateRepository.findAll({
        filter,
        ...pagination,
      }),

      certificateRepository.count(
        filter,
      ),
    ]);

    return {
      certificates,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Get Certificates By Event
 * ============================================================
 */

const getCertificatesByEvent =
  async (
    eventId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    validateObjectId(
      eventId,
      "Event ID",
    );

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const [
      certificates,
      total,
    ] = await Promise.all([
      certificateRepository.getByEvent(
        eventId,
        pagination,
      ),

      certificateRepository.countByEvent(
        eventId,
      ),
    ]);

    return {
      certificates,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Get Certificates By Festival
 * ============================================================
 */

const getCertificatesByFestival =
  async (
    festivalId,
    {
      page = 1,
      limit = 10,
    } = {},
  ) => {
    validateObjectId(
      festivalId,
      "Festival ID",
    );

    const pagination =
      normalizePagination({
        page,
        limit,
      });

    const [
      certificates,
      total,
    ] = await Promise.all([
      certificateRepository.getByFestival(
        festivalId,
        pagination,
      ),

      certificateRepository.countByFestival(
        festivalId,
      ),
    ]);

    return {
      certificates,

      pagination:
        buildPagination({
          ...pagination,
          total,
        }),
    };
  };

/**
 * ============================================================
 * Issue Single Certificate
 * ============================================================
 */

const issueCertificate =
  async (
    certificateId,
  ) => {
    validateObjectId(
      certificateId,
      "Certificate ID",
    );

    const existing =
      await certificateRepository.findByIdRaw(
        certificateId,
      );

    if (!existing) {
      throw new ApiError(
        "Certificate not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      existing.status ===
      "REVOKED"
    ) {
      throw new ApiError(
        "A revoked certificate cannot be issued.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    if (
      existing.status ===
      "ISSUED"
    ) {
      return existing;
    }

    return certificateRepository.updateById(
      certificateId,
      {
        status: "ISSUED",
        issuedAt: new Date(),
      },
    );
  };

/**
 * ============================================================
 * Generate And Send Certificate
 * ============================================================
 *
 * Important:
 *
 * Certificate.verificationCode has select:false in the model.
 *
 * Therefore this function MUST load the certificate using
 * findByIdWithVerificationCode().
 * ============================================================
 */

const generateAndSendCertificate =
  async (
    certificate,
    prePopulated = null,
  ) => {
    const populated = prePopulated ||
      await certificateRepository.findByIdWithVerificationCode(
        certificate._id,
      );

    if (!populated) {
      throw new ApiError(
        "Certificate could not be loaded.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      !populated.verificationCode ||
      !populated.verificationCode.trim()
    ) {
      throw new ApiError(
        "Certificate verification code is required.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const participantName =
      (
        populated.participantName ||
        populated.user?.fullName ||
        "Participant"
      ).trim();

    const email =
      (
        populated.email ||
        populated.user?.email ||
        ""
      ).trim();

    if (!email) {
      throw new ApiError(
        "Participant email is missing.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const certificateForPdf = {
      ...(populated.toObject?.() ||
        populated),

      participantName,

      verificationCode:
        populated.verificationCode,
    };

    const pdfBuffer =
      await certificatePdfService.generateCertificatePdf(
        certificateForPdf,
      );

    await emailUtil.sendCertificateEmail({
      to: email,

      participantName,

      eventName:
        populated.event?.title,

      festivalName:
        populated.festival?.title,

      certificateNumber:
        populated.certificateNumber,

      certificateType:
        populated.certificateType,

      pdfBuffer,
    });

    await certificateRepository.updateById(
      populated._id,
      {
        email,
        emailSent: true,
        emailSentAt:
          new Date(),
        emailError: "",
      },
    );

    return {
      pdfBuffer,
      email,
    };
  };

/**
 * ============================================================
 * Disburse Certificates For Festival
 * ============================================================
 *
 * MAIN ADMIN/FACULTY CERTIFICATE ACTION.
 *
 * Only checked-in, non-cancelled registrations are eligible.
 *
 * Existing certificates are never duplicated.
 *
 * Existing incomplete certificates are repaired by generating
 * a verification code when required.
 *
 * One participant failure does not stop the complete batch.
 * ============================================================
 */

const disburseFestivalCertificates =
  async (
    festivalId,
    adminUser,
  ) => {
    ensureAdminOrFaculty(
      adminUser,
    );

    validateObjectId(
      festivalId,
      "Festival ID",
    );

    const registrations =
      await registrationRepository.findCheckedInByFestival(
        festivalId,
        {
          page: 1,
          limit: 100000,
        },
      );

    const registrationIds = registrations.map(r => r._id);
    const existingCertificatesList = await certificateRepository.findCertificatesWithVerificationCodeByRegistrationIds(registrationIds);
    const certificateMap = new Map();
    for (const cert of existingCertificatesList) {
      const regIdStr = cert.registration?._id?.toString() || cert.registration?.toString();
      const teamMemberIdStr = cert.teamMemberId?._id?.toString() || cert.teamMemberId?.toString() || "individual";
      certificateMap.set(`${regIdStr}_${teamMemberIdStr}`, cert);
    }

    const result = {
      festivalId,
      totalEligible: registrations.length,
      created: 0,
      issued: 0,
      emailed: 0,
      skipped: 0,
      failed: 0,
      details: [],
    };

    for (const registration of registrations) {
      const registrationId = registration._id;
      const regIdStr = registrationId.toString();

      let participants = [];
      if (registration.team && registration.team.members && registration.team.members.length > 0) {
        participants = registration.team.members.map(m => ({
          teamMemberId: m._id,
          user: m.user || null,
          participantName: m.participantName || m.user?.fullName || "",
          participantEmail: m.participantEmail || m.user?.email || ""
        }));
      } else {
        participants = [{
          teamMemberId: null,
          user: registration.user || null,
          participantName: registration.participantName || registration.user?.fullName || "",
          participantEmail: registration.participantEmail || registration.user?.email || ""
        }];
      }

      for (const participant of participants) {
        const teamMemberIdStr = participant.teamMemberId?.toString() || "individual";
        const userIdStr = participant.user?._id?.toString() || participant.user?.toString() || null;

        try {
          let certificate = certificateMap.get(`${regIdStr}_${teamMemberIdStr}`);

          /**
           * ------------------------------------------------------
           * Existing Certificate
           * ------------------------------------------------------
           */

          if (certificate) {
            /**
             * Revoked certificate
             */

            if (
              certificate.status ===
              "REVOKED"
            ) {
              result.skipped += 1;

              result.details.push({
                registrationId,
                teamMemberId: teamMemberIdStr,

                status:
                  "SKIPPED",

                reason:
                  "Certificate was previously revoked.",
              });

              continue;
            }

            /**
             * Already issued
             */

            if (
              certificate.status ===
              "ISSUED"
            ) {
              result.skipped += 1;

              result.details.push({
                registrationId,
                teamMemberId: teamMemberIdStr,

                status:
                  "SKIPPED",

                reason:
                  "Certificate already issued.",

                certificateNumber:
                  certificate.certificateNumber,
              });

              continue;
            }

            /**
             * ----------------------------------------------------
             * Repair missing verification code
             * ----------------------------------------------------
             */

            let certificateWithCode =
              await certificateRepository.findByIdWithVerificationCode(
                certificate._id,
              );

            if (
              !certificateWithCode?.verificationCode
            ) {
              const verificationCode =
                generateVerificationCode();

              await certificateRepository.updateByIdRaw(
                certificate._id,
                {
                  verificationCode,
                },
              );

              certificateWithCode = certificateMap.get(`${regIdStr}_${teamMemberIdStr}`) || 
                await certificateRepository.findByIdWithVerificationCode(
                  certificate._id,
                );
            }

            if (
              !certificateWithCode
            ) {
              throw new ApiError(
                "Certificate could not be loaded after verification code repair.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
              );
            }

            if (
              !certificateWithCode.verificationCode
            ) {
              throw new ApiError(
                "Certificate verification code could not be generated.",
                HTTP_STATUS.INTERNAL_SERVER_ERROR,
              );
            }

            certificate =
              certificateWithCode;
          }

          /**
           * ------------------------------------------------------
           * Create Certificate
           * ------------------------------------------------------
           */

          if (!certificate) {
            certificate =
              await createCertificate(
                {
                  teamMemberId: participant.teamMemberId,
                  user: participant.user,

                  registration:
                    registration._id,

                  event:
                    registration.event?._id ||
                    registration.event,

                  festival:
                    registration.festival?._id ||
                    registration.festival,

                  participantName: participant.participantName,

                  certificateType:
                    "PARTICIPATION",

                  position: "",
                },

                adminUser._id ||
                  adminUser.id,
              );

            result.created += 1;
          }

          /**
           * ------------------------------------------------------
           * Generate PDF + Send Email
           * ------------------------------------------------------
           */

          const delivery =
            await generateAndSendCertificate(
              certificate,
              certificate,
            );

          /**
           * ------------------------------------------------------
           * Issue Certificate
           * ------------------------------------------------------
           */

          const issued =
            await issueCertificate(
              certificate._id,
            );

          result.issued += 1;

          result.emailed += 1;

          result.details.push({
            registrationId,
            teamMemberId: teamMemberIdStr,

            status:
              "EMAILED",

            certificateNumber:
              issued.certificateNumber,

            email:
              delivery.email,
          });
        } catch (error) {
          result.failed += 1;

          /**
           * If the certificate record already exists, record the
           * delivery error without destroying the certificate.
           */

          try {
            const existingCertificate =
              await certificateRepository.findByRegistrationAndTeamMemberId(
                registrationId,
                participant.teamMemberId,
              );

            if (
              existingCertificate
            ) {
              await certificateRepository.updateById(
                existingCertificate._id,
                {
                  emailError:
                    error.message ||
                    "Certificate disbursal failed.",
                },
              );
            }
          } catch {
            // Do not hide the original error.
          }

          result.details.push({
            registrationId,
            teamMemberId: teamMemberIdStr,
            error: error.message || "Failed to disburse certificate.",
          });
        }
      }
    }



    return result;
  };

/**
 * ============================================================
 * Revoke Certificate
 * ============================================================
 */

const revokeCertificate =
  async (
    certificateId,
    reason,
  ) => {
    validateObjectId(
      certificateId,
      "Certificate ID",
    );

    const existing =
      await certificateRepository.findByIdRaw(
        certificateId,
      );

    if (!existing) {
      throw new ApiError(
        "Certificate not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    if (
      existing.status ===
      "REVOKED"
    ) {
      throw new ApiError(
        "Certificate is already revoked.",
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    return certificateRepository.updateById(
      certificateId,
      {
        status: "REVOKED",

        revokedAt:
          new Date(),

        revokedReason:
          reason || "",
      },
    );
  };

/**
 * ============================================================
 * Delete Certificate
 * ============================================================
 */

const deleteCertificate =
  async (
    certificateId,
  ) => {
    validateObjectId(
      certificateId,
      "Certificate ID",
    );

    const existing =
      await certificateRepository.findByIdRaw(
        certificateId,
      );

    if (!existing) {
      throw new ApiError(
        "Certificate not found.",
        HTTP_STATUS.NOT_FOUND,
      );
    }

    await certificateRepository.deleteById(
      certificateId,
    );

    return {
      message:
        "Certificate deleted successfully.",
    };
  };

/**
 * ============================================================
 * Export
 * ============================================================
 */

const certificateService =
  Object.freeze({
    createCertificate,

    getCertificateById,

    getCertificateQR,

    getCertificateByNumber,

    verifyCertificate,

    getMyCertificates,

    getAllCertificates,

    getCertificatesByEvent,

    getCertificatesByFestival,

    issueCertificate,

    revokeCertificate,

    deleteCertificate,

    disburseFestivalCertificates,
  });

export default certificateService;