import { apiClient } from "./axios";

/**
 * ============================================================
 * Get My Certificates
 * ============================================================
 *
 * GET /api/v1/certificates/me
 *
 * Student
 */

export const getCertificates =
  async () => {
    const { data } =
      await apiClient.get(
        "/v1/certificates/me",
      );

    return (
      data?.data?.certificates ||
      []
    );
  };

/**
 * ============================================================
 * Get Public Certificates (Guest)
 * ============================================================
 *
 * GET /api/v1/certificates/public/:registrationId
 */

export const getPublicCertificates =
  async (
    registrationId,
    guestToken,
  ) => {
    if (!registrationId) {
      throw new Error(
        "Registration ID is required.",
      );
    }
    
    if (!guestToken) {
      throw new Error(
        "Guest token is required.",
      );
    }

    const { data } =
      await apiClient.get(
        `/v1/certificates/public/${registrationId}`,
        {
          headers: {
            "X-Guest-Token": guestToken,
          }
        }
      );

    return (
      data?.data?.certificates ||
      []
    );
  };

/**
 * ============================================================
 * Download Public Certificate (Guest)
 * ============================================================
 *
 * GET /api/v1/certificates/public/:registrationId/download/:certificateId
 */

export const downloadPublicCertificate =
  async (
    registrationId,
    certificateId,
    guestToken,
  ) => {
    if (!registrationId || !certificateId || !guestToken) {
      throw new Error(
        "Registration ID, Certificate ID, and Guest token are required.",
      );
    }

    const response =
      await apiClient.get(
        `/v1/certificates/public/${registrationId}/download/${certificateId}`,
        {
          headers: {
            "X-Guest-Token": guestToken,
          },
          responseType: 'blob' // Important for downloading PDF
        }
      );

    return response.data;
  };

/**
 * ============================================================
 * Verify Certificate
 * ============================================================
 *
 * GET /api/v1/certificates/verify/:verificationCode
 *
 * Public
 */

export const verifyCertificate =
  async (
    verificationCode,
  ) => {
    if (!verificationCode) {
      throw new Error(
        "Certificate verification code is required.",
      );
    }

    const { data } =
      await apiClient.get(
        `/v1/certificates/verify/${encodeURIComponent(
          verificationCode,
        )}`,
      );

    return (
      data?.data || null
    );
  };

/**
 * ============================================================
 * Get Festival Certificates
 * ============================================================
 *
 * GET /api/v1/certificates/festival/:festivalId
 *
 * Admin / Faculty
 *
 * Used to see certificates already generated
 * for a festival.
 */

export const getFestivalCertificates =
  async (
    festivalId,
    params = {},
  ) => {
    if (!festivalId) {
      throw new Error(
        "Festival ID is required.",
      );
    }

    const { data } =
      await apiClient.get(
        `/v1/certificates/festival/${festivalId}`,
        {
          params,
        },
      );

    return (
      data?.data || {
        certificates: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      }
    );
  };

/**
 * ============================================================
 * Disburse Festival Certificates
 * ============================================================
 *
 * POST /api/v1/certificates/festival/:festivalId/disburse
 *
 * Admin / Faculty
 *
 * This triggers the complete backend certificate
 * disbursement workflow:
 *
 * checked-in participants
 *       ↓
 * certificate creation
 *       ↓
 * certificate issue
 *       ↓
 * PDF generation
 *       ↓
 * email delivery
 */

export const disburseFestivalCertificates =
  async (
    festivalId,
  ) => {
    if (!festivalId) {
      throw new Error(
        "Festival ID is required.",
      );
    }

    const { data } =
      await apiClient.post(
        `/v1/certificates/festival/${festivalId}/disburse`,
      );

    return (
      data?.data?.result ||
      data?.data ||
      null
    );
  };

export default {
  getCertificates,
  verifyCertificate,
  getFestivalCertificates,
  disburseFestivalCertificates,
  getPublicCertificates,
  downloadPublicCertificate,
};