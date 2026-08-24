import certificateService from "../services/certificate.service.js";

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import HTTP_STATUS from "../constants/httpStatus.js";

const getPagination = (
  req,
) => {
  const page =
    Number(req.query.page) || 1;

  const limit =
    Number(req.query.limit) || 10;

  return {
    page,
    limit,
  };
};

const toPublicCertificate = (
  certificate,
) => ({
  id:
    certificate.id ||
    certificate._id,

  certificateNumber:
    certificate.certificateNumber,

  certificateType:
    certificate.certificateType,

  status:
    certificate.status,

  issuedAt:
    certificate.issuedAt,

  participant:
    certificate.user
      ? {
          fullName:
            certificate.user
              .fullName,
        }
      : null,

  event:
    certificate.event,

  festival:
    certificate.festival,
});

const toSafeCertificate =
  (
    certificate,
  ) => {
    const certificateData =
      typeof certificate.toObject ===
      "function"
        ? certificate.toObject()
        : {
            ...certificate,
          };

    delete certificateData.verificationCode;

    return certificateData;
  };

/**
 * ============================================================
 * Create Certificate
 * ============================================================
 */

const createCertificate =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const certificate =
        await certificateService.createCertificate(
          req.body,
          req.user.id,
        );

      return ApiResponse.success(
        res,
        {
          certificate:
            toSafeCertificate(
              certificate,
            ),
        },
        "Certificate created successfully.",
        HTTP_STATUS.CREATED,
      );
    },
  );

/**
 * ============================================================
 * Get Certificate QR
 * ============================================================
 */

const getCertificateQR =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const certificateQR =
        await certificateService.getCertificateQR(
          req.params.id,
          req.user.id,
          req.user.role,
        );

      return ApiResponse.success(
        res,
        {
          certificateQR,
        },
        "Certificate QR code generated successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Certificate By ID
 * ============================================================
 */

const getCertificateById =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const certificate =
        await certificateService.getCertificateById(
          req.params.id,
        );

      return ApiResponse.success(
        res,
        {
          certificate,
        },
        "Certificate fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Certificate By Number
 * ============================================================
 */

const getCertificateByNumber =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const certificate =
        await certificateService.getCertificateByNumber(
          req.params
            .certificateNumber,
        );

      return ApiResponse.success(
        res,
        {
          certificate:
            toPublicCertificate(
              certificate,
            ),
        },
        "Certificate fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Verify Certificate
 * ============================================================
 */

const verifyCertificate =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const certificate =
        await certificateService.verifyCertificate(
          req.params
            .verificationCode,
        );

      return ApiResponse.success(
        res,
        {
          certificate:
            toPublicCertificate(
              certificate,
            ),

          verified: true,
        },
        "Certificate verified successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get My Certificates
 * ============================================================
 */

const getMyCertificates =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const pagination =
        getPagination(req);

      const result =
        await certificateService.getMyCertificates(
          req.user.id,
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          certificates:
            result.certificates,

          pagination:
            result.pagination,
        },
        "Your certificates fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get All Certificates
 * ============================================================
 */

const getAllCertificates =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const pagination =
        getPagination(req);

      const result =
        await certificateService.getAllCertificates(
          {
            page:
              pagination.page,

            limit:
              pagination.limit,
          },
        );

      return ApiResponse.success(
        res,
        {
          certificates:
            result.certificates,

          pagination:
            result.pagination,
        },
        "Certificates fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Certificates By Event
 * ============================================================
 */

const getCertificatesByEvent =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const pagination =
        getPagination(req);

      const result =
        await certificateService.getCertificatesByEvent(
          req.params.eventId,
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          certificates:
            result.certificates,

          pagination:
            result.pagination,
        },
        "Event certificates fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Get Certificates By Festival
 * ============================================================
 */

const getCertificatesByFestival =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const pagination =
        getPagination(req);

      const result =
        await certificateService.getCertificatesByFestival(
          req.params
            .festivalId,
          pagination,
        );

      return ApiResponse.success(
        res,
        {
          certificates:
            result.certificates,

          pagination:
            result.pagination,
        },
        "Festival certificates fetched successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Issue Certificate
 * ============================================================
 */

const issueCertificate =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const certificate =
        await certificateService.issueCertificate(
          req.params.id,
        );

      return ApiResponse.success(
        res,
        {
          certificate,
        },
        "Certificate issued successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * DISBURSE FESTIVAL CERTIFICATES
 * ============================================================
 *
 * Admin presses this after the fest.
 *
 * Only checked-in registrations are processed.
 */

const disburseFestivalCertificates =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const result =
        await certificateService.disburseFestivalCertificates(
          req.params.festivalId,
          req.user,
        );

      return ApiResponse.success(
        res,
        {
          result,
        },
        "Certificate disbursal completed.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Revoke Certificate
 * ============================================================
 */

const revokeCertificate =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const certificate =
        await certificateService.revokeCertificate(
          req.params.id,
          req.body.reason,
        );

      return ApiResponse.success(
        res,
        {
          certificate,
        },
        "Certificate revoked successfully.",
        HTTP_STATUS.OK,
      );
    },
  );

/**
 * ============================================================
 * Delete Certificate
 * ============================================================
 */

const deleteCertificate =
  asyncHandler(
    async (
      req,
      res,
    ) => {
      const result =
        await certificateService.deleteCertificate(
          req.params.id,
        );

      return ApiResponse.success(
        res,
        null,
        result.message,
        HTTP_STATUS.OK,
      );
    },
  );

const certificateController =
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

    disburseFestivalCertificates,

    revokeCertificate,

    deleteCertificate,
  });

export default certificateController;