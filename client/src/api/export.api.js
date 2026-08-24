import { apiClient } from "./axios";

/**
 * ============================================================
 * Excel Export API
 * ============================================================
 *
 * All export endpoints are protected on the backend.
 * Only authorized admin/faculty users can access them.
 * ============================================================
 */

const downloadExport = async (
  endpoint,
) => {
  const response =
    await apiClient.get(
      endpoint,
      {
        responseType: "blob",
      },
    );

  const blob = new Blob(
    [response.data],
    {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  );

  const contentDisposition =
    response.headers[
      "content-disposition"
    ];

  let filename =
    "scintillace-export.xlsx";

  if (contentDisposition) {
    const match =
      contentDisposition.match(
        /filename="([^"]+)"/,
      );

    if (match?.[1]) {
      filename = match[1];
    }
  }

  const url =
    window.URL.createObjectURL(
      blob,
    );

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(
    link,
  );

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    url,
  );
};

/**
 * Export Users
 */
export const exportUsers =
  () =>
    downloadExport(
      "/v1/export/users",
    );

/**
 * Export Festivals
 */
export const exportFestivals =
  () =>
    downloadExport(
      "/v1/export/festivals",
    );

/**
 * Export Events
 */
export const exportEvents =
  () =>
    downloadExport(
      "/v1/export/events",
    );

/**
 * Export Registrations
 */
export const exportRegistrations =
  () =>
    downloadExport(
      "/v1/export/registrations",
    );

/**
 * Export Payments
 */
export const exportPayments =
  () =>
    downloadExport(
      "/v1/export/payments",
    );

/**
 * Export Accommodation
 */
export const exportAccommodation =
  () =>
    downloadExport(
      "/v1/export/accommodation",
    );

/**
 * Export Tickets
 */
export const exportTickets =
  () =>
    downloadExport(
      "/v1/export/tickets",
    );

/**
 * Export Certificates
 */
export const exportCertificates =
  () =>
    downloadExport(
      "/v1/export/certificates",
    );

/**
 * Export Complete Report
 */
export const exportCompleteReport =
  () =>
    downloadExport(
      "/v1/export/all",
    );

const exportApi =
  Object.freeze({
    exportUsers,
    exportFestivals,
    exportEvents,
    exportRegistrations,
    exportPayments,
    exportAccommodation,
    exportTickets,
    exportCertificates,
    exportCompleteReport,
  });

export default exportApi;