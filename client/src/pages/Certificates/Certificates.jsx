import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaDownload, FaCertificate, FaSpinner } from "react-icons/fa";
import { getPublicCertificates, downloadPublicCertificate } from "../../api/certificate.api";

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchAllCertificates = async () => {
      try {
        setLoading(true);
        setError("");

        // Find all guest tokens in sessionStorage
        const guestTokens = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith("guestToken_")) {
            const registrationId = key.replace("guestToken_", "");
            const token = sessionStorage.getItem(key);
            if (registrationId && token) {
              guestTokens.push({ registrationId, token });
            }
          }
        }

        if (guestTokens.length === 0) {
          if (mounted) {
            setCertificates([]);
            setLoading(false);
          }
          return;
        }

        // Fetch certificates for all registrations
        const promises = guestTokens.map(async ({ registrationId, token }) => {
          try {
            return await getPublicCertificates(registrationId, token);
          } catch (err) {
            console.error(`Failed to fetch certificates for ${registrationId}:`, err);
            return []; // Fail gracefully for individual registrations
          }
        });

        const results = await Promise.all(promises);
        
        // Flatten and sort by date (newest first) if they have a date, otherwise by ID
        const allCertificates = results.flat().filter(Boolean);
        
        if (mounted) {
          setCertificates(allCertificates);
        }
      } catch (err) {
        console.error("Failed to load certificates:", err);
        if (mounted) {
          setError("An error occurred while loading your certificates.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAllCertificates();

    return () => {
      mounted = false;
    };
  }, []);

  const handleDownload = async (cert, tokenInfo = null) => {
    try {
      setDownloadingId(cert.id || cert._id);
      
      // Need to find the token for this specific registration
      let guestToken = tokenInfo;
      if (!guestToken) {
        guestToken = sessionStorage.getItem(`guestToken_${cert.registration}`);
      }

      if (!guestToken) {
        throw new Error("Guest token expired or not found. Please register again to access.");
      }

      const blob = await downloadPublicCertificate(cert.registration, cert.id || cert._id, guestToken);
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `scintillace-certificate-${cert.certificateNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert(err.message || "Failed to download certificate. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 px-6 py-20 text-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="mx-auto mb-4 h-10 w-10 animate-spin text-violet-500" />
          <p className="text-zinc-400">Loading your certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-16">
        <div className="mb-10">
          <Link
            to="/events"
            className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <FaArrowLeft />
            Back to Events
          </Link>

          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            My Certificates
          </h1>

          <p className="mt-4 text-zinc-400 max-w-2xl text-lg">
            View and download your event participation and achievement certificates. 
            Certificates are securely linked to your recent registrations.
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-300">
            {error}
          </div>
        )}

        {certificates.length === 0 && !error ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
            <div className="max-w-md">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800/80 text-violet-500">
                <FaCertificate size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-3">No Certificates Found</h2>
              <p className="text-zinc-400 mb-8">
                We couldn't find any certificates linked to your current session. 
                Certificates are usually generated after you participate in an event and are verified by the organizers.
              </p>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
              >
                Browse Events
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate) => (
              <div
                key={certificate.id || certificate._id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden shadow-xl flex flex-col"
              >
                <div className="bg-gradient-to-br from-violet-900/20 to-zinc-900 p-6 border-b border-zinc-800/50 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    <FaCertificate size={24} />
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                    (certificate.status === 'ISSUED' || certificate.status === 'EMAILED')
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {certificate.status || 'GENERATED'}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {certificate.event?.title || "Event Certificate"}
                  </h2>
                  
                  <div className="mt-4 space-y-3 flex-1">
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Participant</p>
                      <p className="font-semibold text-zinc-200">{certificate.participantName}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">Certificate No.</p>
                      <p className="font-mono text-sm text-violet-300">{certificate.certificateNumber}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleDownload(certificate)}
                    disabled={downloadingId === (certificate.id || certificate._id) || (certificate.status !== 'ISSUED' && certificate.status !== 'EMAILED')}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingId === (certificate.id || certificate._id) ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FaDownload />
                        {(certificate.status === 'ISSUED' || certificate.status === 'EMAILED') ? 'Download PDF' : 'Not Yet Issued'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}