import { useState } from "react";
import { Search, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { verifyCertificate } from "../../api/certificate.api";

export default function VerifyCertificate() {
  const [certificateNumber, setCertificateNumber] = useState("");
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (event) => {
    event.preventDefault();

    const number = certificateNumber.trim();

    if (!number) {
      toast.error("Please enter a certificate number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setCertificate(null);

      const data = await verifyCertificate(number);

      setCertificate(data);

      toast.success("Certificate verified successfully.");
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          "Certificate could not be verified."
      );

      toast.error(
        err?.response?.data?.message ||
          "Invalid or unavailable certificate."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-violet-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6">
        {/* Heading */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <ShieldCheck
              size={32}
              className="text-cyan-400"
            />
          </div>

          <h2 className="mt-6 text-4xl font-black md:text-5xl">
            Verify Certificate
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Verify the authenticity of a Scintillace certificate using
            the unique certificate number.
          </p>
        </div>

        {/* Verification Form */}
        <form
          onSubmit={handleVerify}
          className="mx-auto mt-12 max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8"
        >
          <label
            htmlFor="certificateNumber"
            className="mb-3 block text-sm font-semibold text-slate-300"
          >
            Certificate Number
          </label>

          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                id="certificateNumber"
                type="text"
                value={certificateNumber}
                onChange={(event) =>
                  setCertificateNumber(event.target.value)
                }
                placeholder="Enter certificate number"
                className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-4 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-7 py-4 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Verify
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mx-auto mt-8 flex max-w-2xl items-start gap-4 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-red-300">
            <AlertCircle
              size={22}
              className="mt-0.5 shrink-0"
            />

            <div>
              <h3 className="font-semibold">
                Verification Failed
              </h3>

              <p className="mt-1 text-sm text-red-300/80">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Verified Certificate */}
        {certificate && (
          <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-3xl border border-emerald-400/20 bg-emerald-400/5 backdrop-blur-xl">
            <div className="border-b border-emerald-400/10 bg-emerald-400/10 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-emerald-500/20 p-2">
                  <ShieldCheck
                    size={24}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">
                    Certificate Verified
                  </h3>

                  <p className="text-sm text-emerald-300">
                    This certificate is valid.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <CertificateDetail
                label="Certificate Number"
                value={
                  certificate.certificateNumber ||
                  certificate.number ||
                  certificate.certificate?.certificateNumber ||
                  certificate.certificate?.number ||
                  certificate._id ||
                  "—"
                }
              />

              <CertificateDetail
                label="Participant"
                value={
                  certificate.participantName ||
                  certificate.name ||
                  certificate.user?.name ||
                  certificate.participant?.name ||
                  "—"
                }
              />

              <CertificateDetail
                label="Event"
                value={
                  certificate.event?.title ||
                  certificate.eventName ||
                  certificate.title ||
                  "—"
                }
              />

              <CertificateDetail
                label="Achievement"
                value={
                  certificate.position ||
                  certificate.achievement ||
                  certificate.type ||
                  "—"
                }
              />

              <CertificateDetail
                label="Issued Date"
                value={
                  certificate.issuedAt
                    ? new Date(
                        certificate.issuedAt
                      ).toLocaleDateString()
                    : certificate.date
                      ? new Date(
                          certificate.date
                        ).toLocaleDateString()
                      : "—"
                }
              />

              <CertificateDetail
                label="Status"
                value="Valid"
                valueClassName="text-emerald-400"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CertificateDetail({
  label,
  value,
  valueClassName = "text-white",
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 break-words font-semibold ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}