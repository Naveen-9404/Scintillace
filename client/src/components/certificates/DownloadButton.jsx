import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function DownloadButton({
  certificate,
  className = "",
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!certificate) {
      toast.error("Certificate information is unavailable.");
      return;
    }

    /*
     * The backend may eventually provide a ready-made certificate URL.
     * Prefer that when available.
     */
    const certificateUrl =
      certificate.downloadUrl ||
      certificate.certificateUrl ||
      certificate.fileUrl ||
      certificate.url ||
      certificate.pdfUrl ||
      certificate.certificate?.downloadUrl ||
      certificate.certificate?.certificateUrl ||
      certificate.certificate?.fileUrl ||
      certificate.certificate?.url ||
      certificate.certificate?.pdfUrl;

    if (!certificateUrl) {
      toast.error(
        "Certificate download is not available yet."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(certificateUrl);

      if (!response.ok) {
        throw new Error("Unable to download certificate.");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;

      link.download =
        certificate.fileName ||
        `certificate-${getCertificateNumber(
          certificate
        )}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(blobUrl);

      toast.success("Certificate downloaded.");
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to download certificate."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
          />

          Downloading...
        </>
      ) : (
        <>
          <Download size={18} />

          Download Certificate
        </>
      )}
    </button>
  );
}

function getCertificateNumber(certificate) {
  return (
    certificate?.certificateNumber ||
    certificate?.number ||
    certificate?.certificate?.certificateNumber ||
    certificate?.certificate?.number ||
    certificate?._id ||
    "certificate"
  );
}