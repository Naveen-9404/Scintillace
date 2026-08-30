import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Award,
  CheckCircle2,
  CircleAlert,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  disburseFestivalCertificates,
  getFestivalCertificates,
} from "../../api/certificate.api";

import {
  getFestivals,
} from "../../api/festival.api";

/**
 * ============================================================
 * Admin Certificates
 * ============================================================
 *
 * Certificate workflow:
 *
 * Actual Festivals
 *       ↓
 * Select Festival
 *       ↓
 * Load existing certificates
 *       ↓
 * Admin disburses
 *       ↓
 * Backend finds eligible checked-in participants
 *       ↓
 * Certificates generated / issued
 *       ↓
 * PDFs generated
 *       ↓
 * Emails delivered
 *
 * IMPORTANT:
 *
 * This component intentionally does NOT use:
 *
 * analytics.festivals
 *
 * from the admin overview.
 *
 * Admin analytics contains reporting data and is not a source
 * of Festival documents.
 * ============================================================
 */

export default function AdminCertificates() {
  /**
   * ============================================================
   * Festival State
   * ============================================================
   */

  const [
    festivals,
    setFestivals,
  ] = useState([]);

  const [
    selectedFestivalId,
    setSelectedFestivalId,
  ] = useState("");

  const [
    festivalsLoading,
    setFestivalsLoading,
  ] = useState(true);

  const [
    festivalsError,
    setFestivalsError,
  ] = useState("");

  /**
   * ============================================================
   * Certificate State
   * ============================================================
   */

  const [
    certificates,
    setCertificates,
  ] = useState([]);

  const [
    certificatesLoading,
    setCertificatesLoading,
  ] = useState(false);

  const [
    certificatesError,
    setCertificatesError,
  ] = useState("");

  /**
   * ============================================================
   * Disbursement State
   * ============================================================
   */

  const [
    disbursing,
    setDisbursing,
  ] = useState(false);

  const [
    disbursementMessage,
    setDisbursementMessage,
  ] = useState("");

  const [
    disbursementError,
    setDisbursementError,
  ] = useState("");

  /**
   * ============================================================
   * Load Festivals
   * ============================================================
   */

  const loadFestivals =
    useCallback(
      async () => {
        try {
          setFestivalsLoading(true);
          setFestivalsError("");

          const result =
            await getFestivals({
              page: 1,
              limit: 100,
            });

          const festivalList =
            Array.isArray(
              result?.festivals,
            )
              ? result.festivals
              : [];

          setFestivals(
            festivalList,
          );

          /**
           * Preserve the currently selected festival
           * when refreshing if it still exists.
           */

          setSelectedFestivalId(
            (currentId) => {
              if (
                currentId &&
                festivalList.some(
                  (festival) =>
                    String(
                      festival?._id ||
                        festival?.id,
                    ) ===
                    String(currentId),
                )
              ) {
                return currentId;
              }

              return "";
            },
          );
        } catch (error) {
          console.error(
            "Failed to load festivals:",
            error,
          );

          setFestivalsError(
            error?.response?.data
              ?.message ||
              "Unable to load festivals.",
          );

          setFestivals([]);
          setSelectedFestivalId("");
        } finally {
          setFestivalsLoading(false);
        }
      },
      [],
    );

  /**
   * ============================================================
   * Load Certificates
   * ============================================================
   */

  const loadCertificates =
    useCallback(
      async (
        festivalId,
      ) => {
        if (!festivalId) {
          setCertificates([]);
          return;
        }

        try {
          setCertificatesLoading(true);
          setCertificatesError("");
          setDisbursementMessage("");
          setDisbursementError("");

          const result =
            await getFestivalCertificates(
              festivalId,
              {
                page: 1,
                limit: 100,
              },
            );

          setCertificates(
            Array.isArray(
              result?.certificates,
            )
              ? result.certificates
              : [],
          );
        } catch (error) {
          console.error(
            "Failed to load certificates:",
            error,
          );

          setCertificates([]);

          setCertificatesError(
            error?.response?.data
              ?.message ||
              "Unable to load certificates.",
          );
        } finally {
          setCertificatesLoading(
            false,
          );
        }
      },
      [],
    );

  /**
   * ============================================================
   * Initial Festival Load
   * ============================================================
   */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFestivals();
  }, [loadFestivals]);

  /**
   * ============================================================
   * Festival Selection
   * ============================================================
   */

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCertificates(
      selectedFestivalId,
    );
  }, [
    selectedFestivalId,
    loadCertificates,
  ]);

  /**
   * ============================================================
   * Selected Festival
   * ============================================================
   */

  const selectedFestival =
    useMemo(
      () =>
        festivals.find(
          (festival) =>
            String(
              festival?._id ||
                festival?.id,
            ) ===
            String(
              selectedFestivalId,
            ),
        ) || null,
      [
        festivals,
        selectedFestivalId,
      ],
    );

  /**
   * ============================================================
   * Certificate Statistics
   * ============================================================
   */

  const statistics =
    useMemo(() => {
      const total =
        certificates.length;

      const issued =
        certificates.filter(
          (certificate) =>
            certificate?.status ===
            "ISSUED",
        ).length;

      const generated =
        certificates.filter(
          (certificate) =>
            certificate?.status ===
            "GENERATED",
        ).length;

      const revoked =
        certificates.filter(
          (certificate) =>
            certificate?.status ===
            "REVOKED",
        ).length;

      return {
        total,
        issued,
        generated,
        revoked,
      };
    }, [certificates]);

  /**
   * ============================================================
   * Refresh
   * ============================================================
   */

  const handleRefresh =
    async () => {
      setDisbursementMessage("");
      setDisbursementError("");

      await loadFestivals();

      if (selectedFestivalId) {
        await loadCertificates(
          selectedFestivalId,
        );
      }
    };

  /**
   * ============================================================
   * Disburse Certificates
   * ============================================================
   */

  const handleDisburse =
    async () => {
      if (
        !selectedFestivalId ||
        disbursing
      ) {
        return;
      }

      const festivalName =
        selectedFestival?.title ||
        "the selected festival";

      const confirmed =
        window.confirm(
          `Disburse certificates for ${festivalName}?\n\nOnly eligible checked-in participants will receive certificates.`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setDisbursing(true);
        setDisbursementMessage("");
        setDisbursementError("");

        const result =
          await disburseFestivalCertificates(
            selectedFestivalId,
          );

        /**
         * The backend may return different result
         * structures depending on the service response.
         *
         * We therefore extract the useful counts
         * defensively.
         */

        const created =
          Number(
            result?.created ??
              result?.createdCount ??
              result?.certificatesCreated ??
              result?.generated ??
              0,
          );

        const issued =
          Number(
            result?.issued ??
              result?.issuedCount ??
              result?.certificatesIssued ??
              0,
          );

        const emailed =
          Number(
            result?.emailed ??
              result?.emailsSent ??
              result?.emailSent ??
              0,
          );

        const skipped =
          Number(
            result?.skipped ??
              result?.skippedCount ??
              0,
          );

        const parts = [];

        if (created > 0) {
          parts.push(
            `${created} certificate${
              created === 1
                ? ""
                : "s"
            } created`,
          );
        }

        if (issued > 0) {
          parts.push(
            `${issued} issued`,
          );
        }

        if (emailed > 0) {
          parts.push(
            `${emailed} email${
              emailed === 1
                ? ""
                : "s"
            } sent`,
          );
        }

        if (skipped > 0) {
          parts.push(
            `${skipped} skipped`,
          );
        }

        setDisbursementMessage(
          parts.length > 0
            ? `Certificate disbursement completed: ${parts.join(
                ", ",
              )}.`
            : "Certificate disbursement completed successfully.",
        );

        /**
         * Reload the certificates so the dashboard
         * immediately reflects the latest state.
         */

        await loadCertificates(
          selectedFestivalId,
        );
      } catch (error) {
        console.error(
          "Failed to disburse certificates:",
          error,
        );

        setDisbursementError(
          error?.response?.data
            ?.message ||
            "Unable to disburse certificates.",
        );
      } finally {
        setDisbursing(false);
      }
    };

  /**
   * ============================================================
   * Render
   * ============================================================
   */

  return (
    <section className="space-y-7">
      {/* ======================================================
          Header
          ====================================================== */}

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-violet-400">
          Certificate Management
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
          Certificate Disbursement
        </h2>

        <p className="mt-3 text-sm text-slate-500">
          Issue participation certificates to
          eligible participants who completed
          event check-in.
        </p>
      </div>

      {/* ======================================================
          Festival Selector
          ====================================================== */}

      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-7 shadow-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label
              htmlFor="certificate-festival"
              className="mb-3 block text-sm font-semibold text-slate-200"
            >
              Select Festival
            </label>

            <select
              id="certificate-festival"
              value={
                selectedFestivalId
              }
              onChange={(event) => {
                setSelectedFestivalId(
                  event.target.value,
                );
              }}
              disabled={
                festivalsLoading ||
                disbursing
              }
              className="w-full rounded-xl border border-violet-500/70 bg-slate-950 px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {festivalsLoading
                  ? "Loading festivals..."
                  : "Select a festival"}
              </option>

              {festivals.map(
                (festival) => {
                  const festivalId =
                    festival?._id ||
                    festival?.id;

                  /**
                   * Never render an option without
                   * a valid ID.
                   *
                   * This prevents the previous:
                   *
                   * Untitled Festival
                   *
                   * and React key warning.
                   */

                  if (!festivalId) {
                    return null;
                  }

                  return (
                    <option
                      key={String(
                        festivalId,
                      )}
                      value={String(
                        festivalId,
                      )}
                    >
                      {festival?.title ||
                        "Untitled Festival"}
                    </option>
                  );
                },
              )}
            </select>

            {festivalsError && (
              <p className="mt-2 text-xs text-red-400">
                {festivalsError}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              festivalsLoading ||
              certificatesLoading ||
              disbursing
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                festivalsLoading ||
                certificatesLoading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </div>

      {/* ======================================================
          No Festival Selected
          ====================================================== */}

      {!selectedFestivalId && (
        <div className="flex min-h-[330px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 p-8 text-center">
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-400">
              <Award size={32} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-white">
              Select a festival
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Choose the festival for which
              certificates need to be
              disbursed.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          Selected Festival
          ====================================================== */}

      {selectedFestivalId && (
        <>
          {/* ==================================================
              Loading
              ================================================== */}

          {certificatesLoading && (
            <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 py-14">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Loader2
                  size={20}
                  className="animate-spin text-violet-400"
                />

                Loading certificate data...
              </div>
            </div>
          )}

          {/* ==================================================
              Error
              ================================================== */}

          {!certificatesLoading &&
            certificatesError && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400">
                <div className="flex items-center gap-3">
                  <CircleAlert
                    size={19}
                  />

                  <span>
                    {certificatesError}
                  </span>
                </div>
              </div>
            )}

          {!certificatesLoading &&
            !certificatesError && (
              <>
                {/* ============================================
                    Statistics
                    ============================================ */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatisticCard
                    icon={Users}
                    value={
                      statistics.total
                    }
                    label="Existing Certificates"
                  />

                  <StatisticCard
                    icon={CheckCircle2}
                    value={
                      statistics.issued
                    }
                    label="Issued"
                  />

                  <StatisticCard
                    icon={Award}
                    value={
                      statistics.generated
                    }
                    label="Generated"
                  />

                  <StatisticCard
                    icon={CircleAlert}
                    value={
                      statistics.revoked
                    }
                    label="Revoked"
                  />
                </div>

                {/* ============================================
                    Disbursement
                    ============================================ */}

                <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-7">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600/15 text-violet-400">
                        <ShieldCheck
                          size={24}
                        />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white">
                          Disburse Certificates
                        </h3>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                          This will process eligible
                          checked-in participants for{" "}
                          <strong className="text-slate-200">
                            {selectedFestival?.title ||
                              "the selected festival"}
                          </strong>
                          .
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Existing issued certificates
                          will not be duplicated.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleDisburse
                      }
                      disabled={
                        disbursing
                      }
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {disbursing ? (
                        <>
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />

                          Disbursing...
                        </>
                      ) : (
                        <>
                          <Award
                            size={18}
                          />

                          Disburse Certificates
                        </>
                      )}
                    </button>
                  </div>

                  {/* ==========================================
                      Success Message
                      ========================================== */}

                  {disbursementMessage && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {disbursementMessage}
                      </span>
                    </div>
                  )}

                  {/* ==========================================
                      Error Message
                      ========================================== */}

                  {disbursementError && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                      <CircleAlert
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {disbursementError}
                      </span>
                    </div>
                  )}
                </div>

                {/* ============================================
                    Existing Certificates
                    ============================================ */}

                {certificates.length >
                  0 && (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
                    <div className="border-b border-white/10 px-6 py-5">
                      <h3 className="text-lg font-bold text-white">
                        Existing Certificates
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Certificates already generated
                        for this festival.
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-white/10 bg-white/[0.02]">
                          <tr>
                            <th className="px-6 py-4 font-semibold text-slate-400">
                              Participant
                            </th>

                            <th className="px-6 py-4 font-semibold text-slate-400">
                              Event
                            </th>

                            <th className="px-6 py-4 font-semibold text-slate-400">
                              Certificate
                            </th>

                            <th className="px-6 py-4 font-semibold text-slate-400">
                              Status
                            </th>

                            <th className="px-6 py-4 font-semibold text-slate-400">
                              Email
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
                          {certificates.map(
                            (
                              certificate,
                              index,
                            ) => {
                              const certificateId =
                                certificate?._id ||
                                certificate?.id ||
                                `${certificate?.certificateNumber || "certificate"}-${index}`;

                              const participantName =
                                certificate?.participantName ||
                                certificate?.user?.fullName ||
                                "Participant";

                              const eventName =
                                certificate?.event?.title ||
                                certificate?.event?.name ||
                                "Event";

                              const status =
                                certificate?.status ||
                                "GENERATED";

                              return (
                                <tr
                                  key={String(
                                    certificateId,
                                  )}
                                  className="transition hover:bg-white/[0.02]"
                                >
                                  <td className="px-6 py-4 font-medium text-white">
                                    {
                                      participantName
                                    }
                                  </td>

                                  <td className="px-6 py-4 text-slate-400">
                                    {
                                      eventName
                                    }
                                  </td>

                                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                    {
                                      certificate?.certificateNumber ||
                                      "—"
                                    }
                                  </td>

                                  <td className="px-6 py-4">
                                    <StatusBadge
                                      status={
                                        status
                                      }
                                    />
                                  </td>

                                  <td className="px-6 py-4">
                                    {certificate?.emailSent ? (
                                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
                                        <CheckCircle2
                                          size={
                                            15
                                          }
                                        />

                                        Sent
                                      </span>
                                    ) : (
                                      <span className="text-xs text-slate-500">
                                        Not sent
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            },
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ============================================
                    Empty Certificate State
                    ============================================ */}

                {certificates.length ===
                  0 && (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 px-6 py-12 text-center">
                    <Award
                      size={30}
                      className="mx-auto text-violet-400"
                    />

                    <h3 className="mt-4 text-lg font-bold text-white">
                      No certificates yet
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      No certificates have been
                      generated for this festival.
                      Use the disbursement button
                      above after participant
                      check-in is complete.
                    </p>
                  </div>
                )}
              </>
            )}
        </>
      )}
    </section>
  );
}

/**
 * ============================================================
 * Statistic Card
 * ============================================================
 */

function StatisticCard({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400">
        <Icon size={20} />
      </div>

      <p className="mt-5 text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {label}
      </p>
    </div>
  );
}

/**
 * ============================================================
 * Status Badge
 * ============================================================
 */

function StatusBadge({
  status,
}) {
  const normalizedStatus =
    String(status)
      .toUpperCase();

  const classes = {
    ISSUED:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

    GENERATED:
      "border-violet-500/20 bg-violet-500/10 text-violet-400",

    REVOKED:
      "border-red-500/20 bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
        classes[
          normalizedStatus
        ] ||
        "border-white/10 bg-white/5 text-slate-400"
      }`}
    >
      {normalizedStatus}
    </span>
  );
}